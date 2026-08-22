/**
 * Regression tests for the revive ceiling (2026-08-21, OPEN-ITEMS #196h).
 *
 * PRODUCTION DEFECT: a file whose PUT can never reach R2 (dead network,
 * unreadable source media) could be revived from `failed` without limit.
 * Every revive RE-SIGNS, and every re-sign creates a NEW server-side upload
 * row — so the row count grows without bound while nothing is ingested.
 * `attempts` cannot bound this: it counts PUTs against ONE signed URL and is
 * deliberately reset to 0 by `retry()`.
 *
 * Measured in production (stream qozs68j9zp5p): 3,320 upload rows from ~197
 * files in 13.5 hours, peaking at 34x amplification — 4 files generating 205
 * rows in 30 minutes — with almost nothing ingested. Signing SUCCEEDED every
 * time (74/74 rows carried an upload_source, zero failure messages); the
 * failure was entirely on the client's PUT, which the server never sees.
 */
import { describe, expect, test } from 'vitest'

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

const noopFileSource: FileSource = { getFile: async () => undefined }

const makeEngine = (store: MemoryStore, maxRevives?: number): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test', ...(maxRevives === undefined ? {} : { maxRevives }) },
    store,
    noopFileSource,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )

describe('revive ceiling', () => {
  test('retry() stops reviving a failed item once maxRevives is reached', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store, 3)
    const item = createUploadItem({
      filename: 'unreachable.wav',
      relativePath: 'unreachable.wav',
      fileSizeBytes: 14_000_000,
      streamId: 'teststream'
    })
    await store.put({ ...item, state: 'failed', retryable: true, attempts: 5 })

    // Three revives are allowed — a user recovering from a transient drop.
    for (let i = 0; i < 3; i++) {
      await engine.retry(item.id)
      const revived = await store.get(item.id)
      expect(revived?.state).not.toBe('failed')
      // Simulate the doomed PUT failing again.
      await store.put({ ...(revived as UploadItem), state: 'failed', retryable: true })
    }
    expect((await store.get(item.id))?.revives).toBe(3)

    // The fourth is REFUSED: the item stays failed and is never re-signed,
    // so no further server-side upload row can be created for it.
    await engine.retry(item.id)
    const capped = await store.get(item.id)
    expect(capped?.state).toBe('failed')
    expect(capped?.revives).toBe(3)
    expect(capped?.error).toMatch(/not retried again/)
  })

  test('revives survives retry() (attempts resets, the ceiling must not)', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store, 5)
    const item = createUploadItem({ filename: 'a.wav', relativePath: 'a.wav', fileSizeBytes: 1000, streamId: 's' })
    await store.put({ ...item, state: 'failed', retryable: true, attempts: 5 })

    await engine.retry(item.id)
    const after = await store.get(item.id)
    expect(after?.attempts).toBe(0) // attempts IS reset (existing behaviour)
    expect(after?.revives).toBe(1) // revives is NOT
  })

  test('the ceiling does not apply to duplicate/rejected/cancelled overrides', async () => {
    // These are user-meaningful overrides (e.g. the duplicate override for
    // advisory pre-upload flags) and must stay freely retryable.
    for (const state of ['duplicate', 'rejected', 'cancelled'] as const) {
      const store = new MemoryStore()
      const engine = makeEngine(store, 1)
      const item = createUploadItem({ filename: `${state}.wav`, relativePath: `${state}.wav`, fileSizeBytes: 1000, streamId: 's' })
      await store.put({ ...item, state, revives: 99 })
      await engine.retry(item.id)
      expect((await store.get(item.id))?.state).not.toBe(state)
    }
  })

  test('maxRevives: 0 disables the ceiling (escape hatch)', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store, 0)
    const item = createUploadItem({ filename: 'b.wav', relativePath: 'b.wav', fileSizeBytes: 1000, streamId: 's' })
    await store.put({ ...item, state: 'failed', retryable: true, revives: 999 })
    await engine.retry(item.id)
    expect((await store.get(item.id))?.state).not.toBe('failed')
  })
})
