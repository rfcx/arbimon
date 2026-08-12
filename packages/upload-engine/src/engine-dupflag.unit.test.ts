/**
 * Advisory duplicate flagging (staging-time existence check) + the duplicate
 * Retry override.
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

const mkItem = (state: UploadItemState): UploadItem => ({
  ...createUploadItem({ filename: 'a.wav', relativePath: 'a.wav', fileSizeBytes: 10, streamId: 's1', initialState: 'analyzing' }),
  state,
  timestampUtc: '2026-01-01T00:00:00.000Z'
})

describe('markDuplicateIfStaged', () => {
  test('flags a staged item terminal-duplicate with the advisory note', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const item = mkItem('staged')
    store.items.set(item.id, item)
    const ok = await engine.markDuplicateIfStaged(item.id, 'A recording already exists at this site + time')
    expect(ok).toBe(true)
    const after = store.items.get(item.id)
    expect(after?.state).toBe('duplicate')
    expect(after?.error).toContain('already exists')
  })

  test.each(['queued', 'uploading', 'ingested', 'cancelled'] as UploadItemState[])(
    'refuses to flag a %s item (only STAGED — a moved item wins the race)', async (state) => {
      const store = new MemoryStore()
      const engine = makeEngine(store)
      const item = mkItem(state)
      store.items.set(item.id, item)
      const ok = await engine.markDuplicateIfStaged(item.id)
      expect(ok).toBe(false)
      expect(store.items.get(item.id)?.state).toBe(state)
    })
})

describe('duplicate retry override', () => {
  test('retry() accepts a duplicate item and re-enters the pipeline', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const item: UploadItem = { ...mkItem('duplicate'), error: 'advisory note', checksumSha1: 'abc' }
    store.items.set(item.id, item)
    await engine.retry(item.id)
    const after = store.items.get(item.id)
    expect(after?.state).toBe('ready') // hashed → ready (server re-verdicts at signing)
    expect(after?.error).toBeUndefined()
  })
})