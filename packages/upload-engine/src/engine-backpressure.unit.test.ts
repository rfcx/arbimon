/**
 * Prepare-ahead backpressure (2026-08-13).
 *
 * THE DEFECT THIS FIXES (measured, not theorised): prepare drained the entire
 * `queued` pool regardless of upload progress. For WAVs the prepare stage
 * transcodes to FLAC and parks the encoded Blob in the TranscodeCache until
 * the item is TERMINAL — and `uploaded` is NOT terminal (items wait there
 * through server-side ingest polling). So the encoded backlog scaled with
 * BATCH SIZE, not with concurrency: 40 files at cap 4 held all 40 blobs
 * (~240 MiB). Real sites in the test project are far bigger (Bogota 767,
 * Perth 1,586) => ~5 GiB / ~10 GiB of blob allocation.
 *
 * The bound must satisfy three constraints at once, and the tests below pin
 * all three because fixing (1) alone silently broke (3) during development:
 *   1. bound the encoded backlog
 *   2. keep the upload pool fed (no throughput regression)
 *   3. keep sign batches large (the 08-12 "Waiting for URL" coalescing fix)
 */
import { afterEach, describe, expect, test } from 'vitest'

import { UploadEngine } from './engine'
import { createUploadItem } from './index'
import { type FileSource, type UploadEngineConfig, type UploadItem, type UploadItemState, type UploadStore } from './types'

class MemoryStore implements UploadStore {
  readonly items = new Map<string, UploadItem>()
  async put (item: UploadItem): Promise<void> { this.items.set(item.id, item) }
  async putMany (items: UploadItem[]): Promise<void> { for (const i of items) this.items.set(i.id, i) }
  async get (id: string): Promise<UploadItem | undefined> { return this.items.get(id) }
  async delete (id: string): Promise<void> { this.items.delete(id) }
  async clearTerminal (): Promise<void> {}
  async list (states?: UploadItemState[]): Promise<UploadItem[]> {
    const all = [...this.items.values()]
    return states === undefined ? all : all.filter(i => states.includes(i.state))
  }
}

const realXHR = globalThis.XMLHttpRequest
const realFetch = globalThis.fetch
afterEach(() => { globalThis.XMLHttpRequest = realXHR; globalThis.fetch = realFetch })

const mockSigning = (): { calls: number[] } => {
  const calls: number[] = []
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url).includes('/uploads/bulk')) {
      const body = JSON.parse(String(init?.body)) as { uploads: unknown[] }
      calls.push(body.uploads.length)
      return new Response(JSON.stringify({
        requested: body.uploads.length,
        created: body.uploads.length,
        failed: 0,
        uploads: body.uploads.map((_, index) => ({ index, ok: true, uploadId: `u${index}-${Math.random()}`, url: 'http://put.test/x' }))
      }), { status: 200 })
    }
    return new Response('{}', { status: 200 })
  }) as typeof fetch
  return { calls }
}

/** PUTs that never complete: uploads stay in flight so the queue backs up. */
const mockHangingPuts = (): void => {
  class FakeXHR {
    upload = { onprogress: null as unknown }
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    onabort: (() => void) | null = null
    status = 0
    open (): void {}
    setRequestHeader (): void {}
    getResponseHeader (): string | null { return null }
    abort (): void { this.onabort?.() }
    send (): void { /* never resolves */ }
  }
  globalThis.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest
}

const settle = async (ms = 400): Promise<void> => { await new Promise(resolve => setTimeout(resolve, ms)) }

const mkItems = (n: number, bytes: number): UploadItem[] =>
  Array.from({ length: n }, (_, i) => createUploadItem({
    filename: `f${i}_20260101_000000.wav`, relativePath: `f${i}.wav`, fileSizeBytes: bytes, streamId: 's1'
  }))

const mkEngine = (
  store: MemoryStore,
  overrides: Partial<UploadEngineConfig> = {}
): UploadEngine => {
  const config: UploadEngineConfig = {
    ingestBaseUrl: 'http://ingest.test',
    statusPollIntervalMs: 100000,
    signCoalesceMs: 50,
    ...overrides
  }
  const source: FileSource = { getFile: async () => new Blob([new Uint8Array(8)]) }
  return new UploadEngine(
    config,
    store,
    source,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )
}

describe('prepare-ahead backpressure', () => {
  test('does NOT prepare the whole batch when uploads are stalled', async () => {
    const store = new MemoryStore()
    mockSigning(); mockHangingPuts()
    const engine = mkEngine(store, { prepareAheadMin: 10, prepareAheadFactor: 2 })
    await engine.enqueue(mkItems(300, 1024))
    engine.start()
    await settle(600)

    const stillQueued = (await store.list(['queued'])).length
    const advanced = (await store.list(['ready', 'signing', 'signed', 'uploading', 'uploaded'])).length
    await engine.pause()

    // The whole point: most of the batch must still be untouched.
    expect(stillQueued).toBeGreaterThan(200)
    expect(advanced).toBeLessThan(60)
  })

  test('the BYTE ceiling binds when files are large (count is the wrong unit)', async () => {
    const store = new MemoryStore()
    mockSigning(); mockHangingPuts()
    // 40 MiB files: 8 of them exceed a 256 MiB budget even though the COUNT
    // floor would happily allow 24.
    const engine = mkEngine(store, {
      prepareAheadMin: 24,
      prepareAheadFactor: 3,
      prepareAheadMaxBytes: 256 * 1024 * 1024
    })
    await engine.enqueue(mkItems(100, 40 * 1024 * 1024))
    engine.start()
    await settle(600)

    const advanced = await store.list(['ready', 'signing', 'signed', 'uploading', 'uploaded'])
    const bytes = advanced.reduce((s, i) => s + i.fileSizeBytes, 0)
    await engine.pause()

    // Allow one item of overshoot (one is always let through so a single
    // oversized file cannot deadlock the queue), plus in-flight prepares.
    expect(bytes).toBeLessThanOrEqual(256 * 1024 * 1024 + 3 * 40 * 1024 * 1024)
    expect(advanced.length).toBeLessThan(24)
  })

  test('a single file LARGER than the byte budget still gets through', async () => {
    const store = new MemoryStore()
    mockSigning(); mockHangingPuts()
    const engine = mkEngine(store, { prepareAheadMaxBytes: 1024 })
    await engine.enqueue(mkItems(3, 50 * 1024 * 1024))
    engine.start()
    await settle(500)
    const advanced = (await store.list(['ready', 'signing', 'signed', 'uploading', 'uploaded'])).length
    await engine.pause()
    expect(advanced).toBeGreaterThanOrEqual(1) // no deadlock
  })

  test('cannot deadlock even when the budget is SMALLER than one item', async () => {
    // The `ahead.length > 0` escape hatch only shows its value at tight
    // settings: with prepareAheadMin 1, an empty pipeline would otherwise
    // satisfy `0 + activePrepares >= 1` and refuse to ever start the first
    // prepare — a permanent stall with a full queue. Mutation-guard.
    const store = new MemoryStore()
    mockSigning(); mockHangingPuts()
    const engine = mkEngine(store, {
      prepareAheadMin: 1,
      prepareAheadFactor: 1,
      prepareAheadMaxBytes: 1,
      maxConcurrentUploads: 1
    })
    await engine.enqueue(mkItems(5, 10 * 1024 * 1024))
    engine.start()
    await settle(600)
    const advanced = (await store.list(['ready', 'signing', 'signed', 'uploading', 'uploaded'])).length
    await engine.pause()
    expect(advanced).toBeGreaterThanOrEqual(1)
  })

  test('still keeps the upload pool FED (no throughput regression)', async () => {
    const store = new MemoryStore()
    mockSigning()
    // completing PUTs, so the pipeline drains normally
    let done = 0
    class FakeXHR {
      upload = { onprogress: null as unknown }
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      onabort: (() => void) | null = null
      status = 0
      open (): void {}
      setRequestHeader (): void {}
      getResponseHeader (): string | null { return null }
      abort (): void { this.onabort?.() }
      send (): void { setTimeout(() => { done++; this.status = 200; this.onload?.() }, 5) }
    }
    globalThis.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest

    const engine = mkEngine(store)
    await engine.enqueue(mkItems(60, 1024))
    engine.start()
    await settle(1500)
    await engine.pause()
    // Backpressure must throttle MEMORY, not throughput: the batch should
    // still be moving briskly.
    expect(done).toBeGreaterThan(20)
  })

  test('does NOT shrink sign batches into a per-item trickle', async () => {
    // Regression guard: a naive cap-proportional bound (3-6 items on a slow
    // link) re-introduced the 2026-08-12 "Waiting for URL" bottleneck. The
    // count FLOOR exists precisely to stop that.
    const store = new MemoryStore()
    const signing = mockSigning()
    mockHangingPuts()
    const engine = mkEngine(store, { prepareAheadMin: 24, prepareAheadFactor: 3 })
    await engine.enqueue(mkItems(60, 1024))
    engine.start()
    await settle(800)
    await engine.pause()

    const signed = signing.calls.reduce((a, b) => a + b, 0)
    if (signed > 0) {
      const meanBatch = signed / signing.calls.length
      expect(meanBatch).toBeGreaterThan(1.5)
    }
  })
})
