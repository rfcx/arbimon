/**
 * Sign-batch coalescing (2026-08-12 — the "Waiting for URL" bottleneck).
 *
 * Before: prepares trickled items to `ready` 1-2 at a time and every pump
 * fired a tiny /uploads/bulk call — a 100-file batch became ~50 SERIAL
 * round trips. Now: while the prepare pool is still feeding, a partial
 * batch waits up to signCoalesceMs and goes out as ONE request.
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

/** Track every /uploads/bulk call's batch size via fetch mock (this vitest
 * predates vi.stubGlobal/unstubAllGlobals — manual save/restore). */
const realFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = realFetch })

const mockBulkEndpoint = (): { sizes: number[] } => {
  const sizes: number[] = []
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url).includes('/uploads/bulk')) {
      const body = JSON.parse(String(init?.body)) as { uploads: unknown[] }
      sizes.push(body.uploads.length)
      return new Response(JSON.stringify({
        requested: body.uploads.length,
        created: body.uploads.length,
        failed: 0,
        uploads: body.uploads.map((_, index) => ({ index, ok: true, uploadId: `u${index}`, url: `http://put.test/${index}` }))
      }), { status: 200 })
    }
    return new Response('{}', { status: 200 })
  }) as typeof fetch
  return { sizes }
}

const mkEngine = (store: MemoryStore, prepareDelayMs: number): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test', signCoalesceMs: 100, maxConcurrentUploads: 0 as never },
    store,
    fileSource,
    async () => 'token',
    async () => {
      await new Promise(resolve => setTimeout(resolve, prepareDelayMs))
      return { timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' }
    }
  )

describe('sign-batch coalescing', () => {
  test('a trickle of prepares becomes FEW bulk calls, not one per item', async () => {
    const { sizes } = mockBulkEndpoint()
    const store = new MemoryStore()
    const engine = mkEngine(store, 15) // 12 items × 15ms prepare, 2 at a time
    const items = Array.from({ length: 12 }, (_, i) =>
      createUploadItem({ filename: `f${i}_20260101_000000.wav`, relativePath: `f${i}.wav`, fileSizeBytes: 10, streamId: 's1' }))
    await engine.enqueue(items)
    engine.start()

    // wait until everything is signed (or 5s cap)
    const deadline = Date.now() + 5000
    while (Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 50))
      const signed = await store.list(['signed'])
      if (signed.length === 12) break
    }
    await engine.pause()

    const signed = await store.list(['signed'])
    expect(signed.length).toBe(12)
    // WITHOUT coalescing this is ~6-12 calls; WITH it, the 100ms window
    // gathers the trickle. Allow a little slack for timing raggedness.
    expect(sizes.length).toBeLessThanOrEqual(4)
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(12)
  })

  test('a lone item still signs promptly (flush timer fires)', async () => {
    const { sizes } = mockBulkEndpoint()
    const store = new MemoryStore()
    const engine = mkEngine(store, 1)
    await engine.enqueue([
      createUploadItem({ filename: 'solo_20260101_000000.wav', relativePath: 'solo.wav', fileSizeBytes: 10, streamId: 's1' })
    ])
    engine.start()
    const deadline = Date.now() + 3000
    while (Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 50))
      if ((await store.list(['signed'])).length === 1) break
    }
    await engine.pause()
    expect((await store.list(['signed'])).length).toBe(1)
    expect(sizes).toEqual([1])
  })
})