/**
 * Staged-intake + cancel semantics (import-recordings rebuild, 2026-08-12).
 *
 * The contract under test:
 *  - stage() persists items WITHOUT the pump picking them up
 *  - startStaged() releases staged→queued, skipping analysisError items,
 *    honoring an id selection
 *  - cancel() is terminal failed-like from ANY non-terminal state, discards
 *    sign/multipart context, and Retry re-enters through the pipeline
 *  - retry() of a transcoded item rewinds to queued with the ORIGINAL
 *    file identity (the released-encoded-blob trap)
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

const makeEngine = (store: MemoryStore): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test' },
    store,
    noopFileSource,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )

const mkStaged = (analysisError?: string): UploadItem => ({
  ...createUploadItem({ filename: 'a.wav', relativePath: 'a.wav', fileSizeBytes: 10, streamId: 's1', initialState: 'analyzing' }),
  state: 'staged',
  analysisError
})

describe('stage / startStaged', () => {
  test('staged items are NOT picked up by the pump (no engine start needed to hold them)', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const item = mkStaged()
    await engine.stage([item])
    engine.start()
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(store.items.get(item.id)?.state).toBe('staged')
    await engine.pause()
  })

  test('startStaged releases all staged items to queued', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const a = mkStaged()
    const b = mkStaged()
    await engine.stage([a, b])
    const released = await engine.startStaged()
    expect(released).toBe(2)
    expect(store.items.get(a.id)?.state).toBe('queued')
    expect(store.items.get(b.id)?.state).toBe('queued')
  })

  test('startStaged skips items with an analysisError', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const good = mkStaged()
    const bad = mkStaged('No recording timestamp found.')
    await engine.stage([good, bad])
    const released = await engine.startStaged()
    expect(released).toBe(1)
    expect(store.items.get(bad.id)?.state).toBe('staged')
  })

  test('startStaged honors an id selection', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const a = mkStaged()
    const b = mkStaged()
    await engine.stage([a, b])
    const released = await engine.startStaged([b.id])
    expect(released).toBe(1)
    expect(store.items.get(a.id)?.state).toBe('staged')
    expect(store.items.get(b.id)?.state).toBe('queued')
  })
})

describe('cancel', () => {
  const cancellable: UploadItemState[] = ['staged', 'queued', 'ready', 'signing', 'signed', 'uploading', 'uploaded']

  test.each(cancellable)('cancel from %s → terminal cancelled with context discarded', async (state) => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const item: UploadItem = {
      ...mkStaged(),
      state,
      uploadId: 'u1',
      signedUrl: 'http://x',
      multipart: { multipartUploadId: 'm1', partSizeBytes: 1, partCount: 1, partUrls: [], completedParts: [] }
    }
    store.items.set(item.id, item)
    await engine.cancel(item.id)
    const after = store.items.get(item.id)
    expect(after?.state).toBe('cancelled')
    expect(after?.uploadId).toBeUndefined()
    expect(after?.signedUrl).toBeUndefined()
    expect(after?.multipart).toBeUndefined()
    expect(after?.error).toBe('Cancelled by user.')
  })

  test('cancel leaves terminal states untouched', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    for (const state of ['ingested', 'duplicate', 'failed', 'rejected'] as UploadItemState[]) {
      const item = { ...mkStaged(), state }
      store.items.set(item.id, item)
      await engine.cancel(item.id)
      expect(store.items.get(item.id)?.state).toBe(state)
    }
  })

  test('retry re-enters a cancelled item (ready when hashed, queued when not)', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const hashed: UploadItem = { ...mkStaged(), state: 'cancelled', checksumSha1: 'abc' }
    const unhashed: UploadItem = { ...mkStaged(), state: 'cancelled' }
    store.items.set(hashed.id, hashed)
    store.items.set(unhashed.id, unhashed)
    await engine.retry(hashed.id)
    await engine.retry(unhashed.id)
    expect(store.items.get(hashed.id)?.state).toBe('ready')
    expect(store.items.get(unhashed.id)?.state).toBe('queued')
    expect(store.items.get(hashed.id)?.error).toBeUndefined()
  })
})

describe('pauseItems (per-item pause → staged)', () => {
  test.each(['queued', 'ready', 'signing', 'signed', 'uploading'] as UploadItemState[])(
    'pauses a %s item back to staged with context discarded', async (state) => {
      const store = new MemoryStore()
      const engine = makeEngine(store)
      const item: UploadItem = { ...mkStaged(), state, uploadId: 'u1', signedUrl: 'http://x' }
      store.items.set(item.id, item)
      const n = await engine.pauseItems([item.id])
      expect(n).toBe(1)
      const after = store.items.get(item.id)
      expect(after?.state).toBe('staged')
      expect(after?.uploadId).toBeUndefined()
      expect(after?.signedUrl).toBeUndefined()
    })

  test('leaves uploaded/terminal/staged items alone', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    for (const state of ['uploaded', 'ingested', 'failed', 'staged'] as UploadItemState[]) {
      const item = { ...mkStaged(), state }
      store.items.set(item.id, item)
      const n = await engine.pauseItems([item.id])
      expect(n).toBe(0)
      expect(store.items.get(item.id)?.state).toBe(state)
    }
  })
})

describe('retry of a transcoded item (released-blob trap)', () => {
  test('rewinds to queued with the ORIGINAL identity, dropping the FLAC name/checksum', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const item: UploadItem = {
      ...mkStaged(),
      state: 'failed',
      filename: 'a.flac',
      fileSizeBytes: 5,
      transcoded: true,
      originalFilename: 'a.wav',
      originalFileSizeBytes: 10,
      checksumSha1: 'flac-sha'
    }
    store.items.set(item.id, item)
    await engine.retry(item.id)
    const after = store.items.get(item.id)
    expect(after?.state).toBe('queued') // NOT ready — must re-prepare
    expect(after?.filename).toBe('a.wav')
    expect(after?.fileSizeBytes).toBe(10)
    expect(after?.transcoded).toBeUndefined()
    expect(after?.checksumSha1).toBeUndefined()
  })
})
