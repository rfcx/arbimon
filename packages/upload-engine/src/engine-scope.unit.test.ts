/**
 * Engine scoping (multi-project pop-outs, 2026-08-12): a scoped engine drives
 * ONLY items matching its predicate; unscoped reads (stats) see everything.
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

const mkStaged = (projectSlug: string): UploadItem => ({
  ...createUploadItem({ filename: 'a.wav', relativePath: 'a.wav', fileSizeBytes: 10, streamId: 's1', projectSlug, initialState: 'analyzing' }),
  state: 'staged'
})

describe('engine scope', () => {
  test('startStaged releases only in-scope items', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const a = mkStaged('project-a')
    const b = mkStaged('project-b')
    await engine.stage([a, b])
    engine.setScope(item => item.projectSlug === 'project-a')
    const released = await engine.startStaged()
    expect(released).toBe(1)
    expect(store.items.get(a.id)?.state).toBe('queued')
    expect(store.items.get(b.id)?.state).toBe('staged')
  })

  test('recoverStalled ignores out-of-scope stranded items', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const mine: UploadItem = { ...mkStaged('project-a'), state: 'uploading' }
    const theirs: UploadItem = { ...mkStaged('project-b'), state: 'uploading' }
    store.items.set(mine.id, mine)
    store.items.set(theirs.id, theirs)
    engine.setScope(item => item.projectSlug === 'project-a')
    const recovered = await engine.recoverStalled()
    expect(recovered).toBe(1)
    expect(store.items.get(mine.id)?.state).toBe('signed')
    expect(store.items.get(theirs.id)?.state).toBe('uploading') // untouched
  })

  test('exclusion scope (main window with a live popout) skips that project', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const a = mkStaged('project-a')
    const b = mkStaged('project-b')
    const legacy: UploadItem = { ...mkStaged('x'), projectSlug: undefined }
    await engine.stage([a, b, legacy])
    const excluded = new Set(['project-a'])
    engine.setScope(item => item.projectSlug === undefined || !excluded.has(item.projectSlug))
    const released = await engine.startStaged()
    expect(released).toBe(2) // b + legacy
    expect(store.items.get(a.id)?.state).toBe('staged')
  })

  test('stats remain unscoped (UI sees everything)', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    await engine.stage([mkStaged('project-a'), mkStaged('project-b')])
    engine.setScope(item => item.projectSlug === 'project-a')
    const stats = await engine.stats()
    expect(stats.total).toBe(2)
  })
})