/**
 * Background prestage (2026-08-12): non-WAV staged files get sha1 + signed
 * URL while parked; signing doubles as the dedup check (Duplicate. → terminal
 * duplicate immediately); Start fast-tracks prestaged items to `signed`.
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

const fileSource: FileSource = { getFile: async () => new Blob([new Uint8Array(16)]) }

const realFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = realFetch })

/** Mock /uploads/bulk: per-checksum scripted outcomes; records batch sizes. */
const mockBulk = (outcomes: Record<string, { ok: boolean, error?: string }>): { calls: number[] } => {
  const calls: number[] = []
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url).includes('/uploads/bulk')) {
      const body = JSON.parse(String(init?.body)) as { uploads: Array<{ checksum?: string }> }
      calls.push(body.uploads.length)
      return new Response(JSON.stringify({
        requested: body.uploads.length,
        created: 0,
        failed: 0,
        uploads: body.uploads.map((u, index) => {
          const script = outcomes[u.checksum ?? ''] ?? { ok: true }
          return script.ok
            ? { index, ok: true, uploadId: `u-${index}`, url: `http://put.test/${index}` }
            : { index, ok: false, status: 400, error: script.error }
        })
      }), { status: 200 })
    }
    return new Response('{}', { status: 200 })
  }) as typeof fetch
  return { calls }
}

const makeEngine = (store: MemoryStore): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test' },
    store,
    fileSource,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )

const mkStaged = (filename: string): UploadItem => ({
  ...createUploadItem({ filename, relativePath: filename, fileSizeBytes: 16, streamId: 's1', initialState: 'analyzing' }),
  state: 'staged',
  timestampUtc: '2026-01-01T00:00:00.000Z'
})

// sha1 of 16 zero bytes (what fileSource serves)
const ZERO16_SHA1 = 'e129f27c5103bc5cc44bcdf0a15e160d445066ff'

describe('prestage', () => {
  test('non-WAV staged items get checksum + signed URL; state stays staged', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    mockBulk({})
    const flac = mkStaged('a.flac')
    store.items.set(flac.id, flac)
    const n = await engine.prestage([flac.id])
    expect(n).toBe(1)
    const after = store.items.get(flac.id)
    expect(after?.state).toBe('staged')
    expect(after?.checksumSha1).toBe(ZERO16_SHA1)
    expect(after?.signedUrl).toBeDefined()
    expect(after?.uploadId).toBeDefined()
  })

  test('WAVs are NEVER prestaged (encoding must not begin before Start)', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    const { calls } = mockBulk({})
    const wav = mkStaged('a.wav')
    store.items.set(wav.id, wav)
    const n = await engine.prestage([wav.id])
    expect(n).toBe(0)
    expect(calls.length).toBe(0)
    expect(store.items.get(wav.id)?.checksumSha1).toBeUndefined()
  })

  test('Duplicate. verdict → terminal duplicate immediately (independent of Start)', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    mockBulk({ [ZERO16_SHA1]: { ok: false, error: 'Duplicate.' } })
    const flac = mkStaged('dup.flac')
    store.items.set(flac.id, flac)
    await engine.prestage([flac.id])
    expect(store.items.get(flac.id)?.state).toBe('duplicate')
  })

  test('non-retryable sign error surfaces as analysisError, stays staged + excluded from Start', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    mockBulk({ [ZERO16_SHA1]: { ok: false, error: 'Project recording-minute limit exceeded.' } })
    const flac = mkStaged('over.flac')
    store.items.set(flac.id, flac)
    await engine.prestage([flac.id])
    const after = store.items.get(flac.id)
    expect(after?.state).toBe('staged')
    expect(after?.analysisError).toContain('limit exceeded')
    const released = await engine.startStaged([flac.id])
    expect(released).toBe(0)
  })

  test('startStaged fast-tracks prestaged items to signed; plain staged go to queued', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    mockBulk({})
    const pre = mkStaged('pre.flac')
    const plain = mkStaged('plain.flac')
    store.items.set(pre.id, pre)
    store.items.set(plain.id, plain)
    await engine.prestage([pre.id]) // pre now carries url+checksum
    const released = await engine.startStaged([pre.id, plain.id])
    expect(released).toBe(2)
    expect(store.items.get(pre.id)?.state).toBe('signed')
    expect(store.items.get(plain.id)?.state).toBe('queued')
  })

  test('a result never resurrects an item the user moved mid-flight', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    // slow bulk response; cancel the item while the request is in flight
    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
      if (String(url).includes('/uploads/bulk')) {
        const body = JSON.parse(String(init?.body)) as { uploads: unknown[] }
        await new Promise(resolve => setTimeout(resolve, 150))
        return new Response(JSON.stringify({
          requested: 1,
created: 1,
failed: 0,
          uploads: body.uploads.map((_, index) => ({ index, ok: true, uploadId: 'u1', url: 'http://put.test/1' }))
        }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    }) as typeof fetch
    const flac = mkStaged('race.flac')
    store.items.set(flac.id, flac)
    const prestagePromise = engine.prestage([flac.id])
    await new Promise(resolve => setTimeout(resolve, 50))
    await engine.cancel(flac.id) // user cancels mid-prestage
    await prestagePromise
    const after = store.items.get(flac.id)
    expect(after?.state).toBe('cancelled')
    expect(after?.signedUrl).toBeUndefined()
  })
})
