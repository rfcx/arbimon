/**
 * Orphaned file handles after a session restore (2026-08-14).
 *
 * THE DEFECT (measured on the demo tier): the queue persists in IndexedDB but
 * `BrowserFileSource` holds File handles IN MEMORY. After any full reload the
 * rows come back with their checksums, parsed timestamps and hand-corrected
 * dates intact — and are completely unreadable. Nothing surfaced that until
 * the user pressed Start, at which point all 5 rows went `rejected` with
 * "Session interrupted — re-add this folder to resume".
 *
 * Measured, before the fix:
 *   staged rows after reload : 5/5 survive
 *   file handles after reload: 0/5 survive
 *   warning shown before Start: NONE
 *
 * The contract under test is therefore two-sided:
 *  - orphans must be flagged BEFORE the user commits, and
 *  - the flag must NOT destroy the row (the rest of its work is still valid,
 *    and re-adding the folder re-attaches the handle by item id).
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

/** A file source whose handles can be dropped, simulating a reload. */
class DroppableSource implements FileSource {
  private readonly files = new Map<string, Blob>()
  register (id: string): void { this.files.set(id, new Blob([new Uint8Array(64)])) }
  dropAll (): void { this.files.clear() }
  restore (id: string): void { this.files.set(id, new Blob([new Uint8Array(64)])) }
  async getFile (id: string): Promise<Blob | undefined> { return this.files.get(id) }
}

const mkEngine = (store: MemoryStore, source: FileSource): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test', statusPollIntervalMs: 100000 },
    store,
    source,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )

const stagedItem = (n: number): UploadItem => ({
  ...createUploadItem({
    filename: `rec-${n}.flac`, relativePath: `rec-${n}.flac`, fileSizeBytes: 4096, streamId: 's1'
  }),
  state: 'staged',
  timestampUtc: '2026-01-01T00:00:00.000Z',
  checksumSha1: 'abc'
})

describe('orphaned file handles', () => {
  test('flags staged rows whose handle is gone', async () => {
    const store = new MemoryStore()
    const source = new DroppableSource()
    const items = [stagedItem(1), stagedItem(2), stagedItem(3)]
    for (const i of items) { await store.put(i); source.register(i.id) }

    const engine = mkEngine(store, source)
    // nothing wrong yet
    expect(await engine.flagMissingFileHandles()).toBe(0)

    // simulate the reload: rows persist, handles do not
    source.dropAll()
    expect(await engine.flagMissingFileHandles()).toBe(3)

    const after = await store.list()
    expect(after).toHaveLength(3) // NOT destroyed
    for (const i of after) {
      expect(i.state).toBe('staged') // still staged, still restartable
      expect(i.notice).toMatch(/re-add this folder/i)
    }
  })

  test('the row KEEPS its expensive work (this is why it is not rejected)', async () => {
    const store = new MemoryStore()
    const source = new DroppableSource()
    const item = {
      ...stagedItem(1),
      localWallTime: '1999-12-31T23:59:59',
      timezoneSource: 'manual' as const,
      timezoneName: 'UTC'
    }
    await store.put(item); source.register(item.id)
    const engine = mkEngine(store, source)
    source.dropAll()
    await engine.flagMissingFileHandles()

    const after = await store.get(item.id) as UploadItem
    expect(after.checksumSha1).toBe('abc')
    expect(after.timestampUtc).toBe('2026-01-01T00:00:00.000Z')
    // the irreplaceable bit: a hand-made correction must not be discarded
    expect(after.timezoneSource).toBe('manual')
    expect(after.localWallTime).toBe('1999-12-31T23:59:59')
  })

  test('re-adding the folder CLEARS the notice', async () => {
    const store = new MemoryStore()
    const source = new DroppableSource()
    const item = stagedItem(1)
    await store.put(item); source.register(item.id)
    const engine = mkEngine(store, source)

    source.dropAll()
    await engine.flagMissingFileHandles()
    expect((await store.get(item.id))?.notice).toBeDefined()

    // user re-adds the same folder -> handle re-attaches by item id
    source.restore(item.id)
    expect(await engine.flagMissingFileHandles()).toBe(0)
    expect((await store.get(item.id))?.notice).toBeUndefined()
  })

  test('rows with handles are never flagged', async () => {
    const store = new MemoryStore()
    const source = new DroppableSource()
    const items = [stagedItem(1), stagedItem(2)]
    for (const i of items) { await store.put(i); source.register(i.id) }
    const engine = mkEngine(store, source)
    expect(await engine.flagMissingFileHandles()).toBe(0)
    for (const i of await store.list()) expect(i.notice).toBeUndefined()
  })

  test('terminal rows are not probed (nothing to re-upload)', async () => {
    const store = new MemoryStore()
    const source = new DroppableSource()
    const done: UploadItem = { ...stagedItem(1), state: 'ingested' }
    await store.put(done)
    const engine = mkEngine(store, source)
    // no handle registered at all, yet an ingested row must not be flagged
    expect(await engine.flagMissingFileHandles()).toBe(0)
    expect((await store.get(done.id))?.notice).toBeUndefined()
  })
})
