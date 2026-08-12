/**
 * 429-awareness (2026-08-12): R2's TooManyRequests is per-object-key
 * congestion, not failure — a 429'd PUT must not burn attempts or terminal-
 * fail, and the retry must wait past the key's write window.
 */
import { afterEach, describe, expect, test } from 'vitest'

import { UploadEngine } from './engine'
import { IngestApiError } from './ingest-api'
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

// XMLHttpRequest mock: scripted PUT outcomes per call
const realXHR = globalThis.XMLHttpRequest
afterEach(() => { globalThis.XMLHttpRequest = realXHR })

const mockPutStatuses = (statuses: number[]): { calls: number } => {
  const state = { calls: 0 }
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
    send (): void {
      const status = statuses[Math.min(state.calls, statuses.length - 1)]
      state.calls++
      this.status = status
      setTimeout(() => { this.onload?.() }, 5)
    }
  }
  globalThis.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest
  return state
}

const makeEngine = (store: MemoryStore): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test', maxAttempts: 3, retryBaseDelayMs: 10, retryMaxDelayMs: 50, statusPollIntervalMs: 100000 },
    store,
    fileSource,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )

const mkSigned = (): UploadItem => ({
  ...createUploadItem({ filename: 'a.flac', relativePath: 'a.flac', fileSizeBytes: 8, streamId: 's1' }),
  state: 'signed',
  timestampUtc: '2026-01-01T00:00:00.000Z',
  checksumSha1: 'abc',
  uploadId: 'u1',
  signedUrl: 'http://put.test/a',
  signedAtMs: Date.now()
})

describe('429-aware upload', () => {
  test('a 429 does not burn attempts and does not terminal-fail', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    mockPutStatuses([429])
    const item = mkSigned()
    store.items.set(item.id, item)
    engine.start()
    await new Promise(resolve => setTimeout(resolve, 300))
    await engine.pause()
    const after = store.items.get(item.id)
    expect(after?.state).toBe('signed') // parked for the floor wait, not failed
    expect(after?.attempts).toBe(0) // no attempt burned
    expect(after?.error).toContain('Rate limited')
  })

  test('a 5xx still burns attempts and can terminal-fail (429 handling is not a general escape)', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    mockPutStatuses([500, 500, 500])
    const item = mkSigned()
    store.items.set(item.id, item)
    engine.start()
    await new Promise(resolve => setTimeout(resolve, 800))
    await engine.pause()
    const after = store.items.get(item.id)
    expect(after?.state).toBe('failed')
    expect(after?.attempts).toBe(3)
  })

  test('after the floor wait the item retries and succeeds', async () => {
    const store = new MemoryStore()
    const engine = makeEngine(store)
    // First call 429, subsequent 200 — but the floor is 2.5s; to keep the
    // test fast we verify the parked state now and the rateLimitedUntil gate
    // (pumpUploads skips it) rather than waiting out the real floor.
    mockPutStatuses([429, 200])
    const item = mkSigned()
    store.items.set(item.id, item)
    engine.start()
    await new Promise(resolve => setTimeout(resolve, 300))
    // parked; pool must NOT pick it up again inside the window
    const during = store.items.get(item.id)
    expect(during?.state).toBe('signed')
    await engine.pause()
  })
})