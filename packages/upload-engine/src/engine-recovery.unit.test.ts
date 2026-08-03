/**
 * Regression tests for the 2026-08-03 stalled-queue fix.
 *
 * PRODUCTION DEFECT: a mid-batch network failure (or a tab close) leaves items
 * stranded in a transient in-flight state. `pumpUploads()` only ever picks up
 * `signed`, and `retry()` only accepts `failed`/`rejected` — so nothing in the
 * engine ever returned an orphaned `uploading` item to the pool. The queue
 * looked busy forever while nothing progressed, and the user's only recourse
 * was to re-drop the folder (which then produced server-side duplicate flags).
 *
 * Measured in production: 21,897 uploads signed server-side with bytes never
 * sent for a single user in one session, with no client-side recovery.
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

const noopFileSource: FileSource = {
  getFile: async () => undefined
}

const makeEngine = (store: MemoryStore): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test' },
    store,
    noopFileSource,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )

const seed = (store: MemoryStore, state: UploadItemState): UploadItem => {
  const item = { ...createUploadItem({ filename: `f-${state}.wav`, relativePath: `f-${state}.wav`, fileSizeBytes: 10, streamId: 's1' }), state }
  store.items.set(item.id, item)
  return item
}

describe('recoverStalled', () => {
  test('returns an orphaned `uploading` item to `signed` (the production wedge)', async () => {
    const store = new MemoryStore()
    const item = seed(store, 'uploading')
    const engine = makeEngine(store)

    const recovered = await engine.recoverStalled()

    expect(recovered).toBe(1)
    expect(store.items.get(item.id)?.state).toBe('signed')
  })

  test('returns `signing` to `ready` and `preparing` to `queued`', async () => {
    const store = new MemoryStore()
    const signing = seed(store, 'signing')
    const preparing = seed(store, 'preparing')
    const engine = makeEngine(store)

    await engine.recoverStalled()

    expect(store.items.get(signing.id)?.state).toBe('ready')
    expect(store.items.get(preparing.id)?.state).toBe('queued')
  })

  test('never touches terminal or already-pumpable states', async () => {
    const store = new MemoryStore()
    const untouched: UploadItemState[] = ['ingested', 'duplicate', 'rejected', 'failed', 'signed', 'ready', 'queued', 'uploaded', 'paused']
    const seeded = untouched.map(state => seed(store, state))
    const engine = makeEngine(store)

    const recovered = await engine.recoverStalled()

    expect(recovered).toBe(0)
    for (const item of seeded) {
      expect(store.items.get(item.id)?.state).toBe(item.state)
    }
  })

  test('clears stale progress so the meter does not lie after recovery', async () => {
    const store = new MemoryStore()
    const item = seed(store, 'uploading')
    store.items.set(item.id, { ...item, progress: 0.42 })
    const engine = makeEngine(store)

    await engine.recoverStalled()

    expect(store.items.get(item.id)?.progress).toBeUndefined()
  })

  test('is idempotent — a second call recovers nothing', async () => {
    const store = new MemoryStore()
    seed(store, 'uploading')
    const engine = makeEngine(store)

    expect(await engine.recoverStalled()).toBe(1)
    expect(await engine.recoverStalled()).toBe(0)
  })
})
