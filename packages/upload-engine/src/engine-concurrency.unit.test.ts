/**
 * Runtime-adjustable upload concurrency (2026-08-13). The cap is user-facing,
 * so the guarantees that matter are: it takes effect without a restart,
 * lowering it never aborts work already in flight, and it can never be driven
 * to a value that stalls the queue.
 */
import { afterEach, describe, expect, test } from 'vitest'

import { UploadEngine } from './engine'
import { createUploadItem } from './index'
import { type FileSource, type UploadItem, type UploadItemState, type UploadStore } from './types'

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

const fileSource: FileSource = { getFile: async () => new Blob([new Uint8Array(8)]) }

const realXHR = globalThis.XMLHttpRequest
afterEach(() => { globalThis.XMLHttpRequest = realXHR })

/** PUTs that hang until released, so we can observe how many run at once. */
const mockHangingPuts = (): { inFlight: () => number, peak: () => number, releaseAll: () => void } => {
  let inFlight = 0
  let peak = 0
  const pending: Array<() => void> = []
  class FakeXHR {
    upload = { onprogress: null as unknown }
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    onabort: (() => void) | null = null
    status = 0
    open (): void {}
    setRequestHeader (): void {}
    getResponseHeader (): string | null { return null }
    abort (): void { inFlight--; this.onabort?.() }
    send (): void {
      inFlight++
      peak = Math.max(peak, inFlight)
      pending.push(() => { inFlight--; this.status = 200; this.onload?.() })
    }
  }
  globalThis.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest
  return {
    inFlight: () => inFlight,
    peak: () => peak,
    releaseAll: () => { while (pending.length > 0) pending.shift()?.() }
  }
}

const makeEngine = (store: MemoryStore, maxConcurrentUploads?: number): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test', maxConcurrentUploads, statusPollIntervalMs: 100000 },
    store,
    fileSource,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )

const mkSigned = (n: number): UploadItem => ({
  ...createUploadItem({ filename: `f${n}.flac`, relativePath: `f${n}.flac`, fileSizeBytes: 8, streamId: 's1' }),
  state: 'signed',
  timestampUtc: '2026-01-01T00:00:00.000Z',
  checksumSha1: 'abc',
  uploadId: `u${n}`,
  signedUrl: `http://put.test/f${n}`,
  signedAtMs: Date.now()
})

const settle = async (ms = 60): Promise<void> => { await new Promise(resolve => setTimeout(resolve, ms)) }

describe('runtime upload concurrency', () => {
  test('defaults to 4', () => {
    expect(makeEngine(new MemoryStore()).maxConcurrentUploads).toBe(4)
  })

  test('honours an explicit config value', () => {
    expect(makeEngine(new MemoryStore(), 2).maxConcurrentUploads).toBe(2)
  })

  test('the cap bounds how many PUTs run at once', async () => {
    const store = new MemoryStore()
    for (let i = 0; i < 8; i++) await store.put(mkSigned(i))
    const puts = mockHangingPuts()
    const engine = makeEngine(store, 2)
    engine.start()
    await settle()
    expect(puts.inFlight()).toBe(2)
    expect(puts.peak()).toBe(2)
    puts.releaseAll()
    await engine.pause()
  })

  test('raising the cap starts more uploads WITHOUT a restart', async () => {
    const store = new MemoryStore()
    for (let i = 0; i < 8; i++) await store.put(mkSigned(i))
    const puts = mockHangingPuts()
    const engine = makeEngine(store, 2)
    engine.start()
    await settle()
    expect(puts.inFlight()).toBe(2)

    engine.setMaxConcurrentUploads(5)
    await settle()
    expect(engine.maxConcurrentUploads).toBe(5)
    expect(puts.inFlight()).toBe(5) // pool refilled on the next pass
    puts.releaseAll()
    await engine.pause()
  })

  test('lowering the cap does NOT abort in-flight uploads', async () => {
    const store = new MemoryStore()
    for (let i = 0; i < 8; i++) await store.put(mkSigned(i))
    const puts = mockHangingPuts()
    const engine = makeEngine(store, 4)
    engine.start()
    await settle()
    expect(puts.inFlight()).toBe(4)

    engine.setMaxConcurrentUploads(1)
    await settle()
    // the 4 already running keep going; the pool just stops refilling
    expect(puts.inFlight()).toBe(4)
    expect(engine.maxConcurrentUploads).toBe(1)
    puts.releaseAll()
    await engine.pause()
  })

  test('clamps to >= 1 so the queue can never stall', () => {
    const engine = makeEngine(new MemoryStore(), 4)
    engine.setMaxConcurrentUploads(0)
    expect(engine.maxConcurrentUploads).toBe(1)
    engine.setMaxConcurrentUploads(-5)
    expect(engine.maxConcurrentUploads).toBe(1)
  })

  test('floors fractional values', () => {
    const engine = makeEngine(new MemoryStore(), 4)
    engine.setMaxConcurrentUploads(3.9)
    expect(engine.maxConcurrentUploads).toBe(3)
  })
})
