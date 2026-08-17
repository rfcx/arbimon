/**
 * Sign-path retryability classification.
 *
 * THE DEFECT: a PERMANENT server rejection that matched none of
 * NON_RETRYABLE_SIGN_ERRORS was classified `failed, retryable: true`, so the UI
 * offered the user a Retry that can never succeed — re-signing the identical
 * file+params returns the identical rejection, forever.
 *
 * Audited against `routes/uploads.js` in `rfcx/ingest-service`, FOUR permanent
 * rejections were unmatched (only the duration one was previously recorded):
 *   1. `Audio duration is more than 24 hours`   (validateUploadParams)
 *   2. `fileSize is required for multipart uploads.`
 *   3. `Multipart is for files >= 100MB; use POST /uploads for smaller files.`
 *   4. `File is too large for the configured part size.`
 *
 * The ingest-side (post-upload) duration rejection was ALREADY correct: the
 * server marks it `retryable: false` and `applyServerStatus` honours that. The
 * defect was confined to the SIGN path.
 *
 * Both directions are asserted. Over-rejecting is the MIRROR defect (a
 * transient 500 would strand a file the user could have retried), so the
 * retryable cases are tested explicitly rather than assumed.
 */
import { afterEach, describe, expect, test } from 'vitest'

import { UploadEngine } from './engine'
import { createUploadItem } from './index'
import { MULTIPART_THRESHOLD_BYTES } from './multipart'
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

const realFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = realFetch })

/** Bulk sign fails every item with `error`; multipart create fails with `status`. */
const signAttempts = { multipart: 0 }

const mockSignEndpoints = (opts: {
  bulkError?: string
  bulkStatus?: number
  multipartStatus?: number
  multipartMessage?: string
}): void => {
  signAttempts.multipart = 0
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    const href = String(url)
    if (href.includes('/uploads/multipart')) {
      signAttempts.multipart++
      return new Response(
        JSON.stringify({ message: opts.multipartMessage ?? 'nope' }),
        { status: opts.multipartStatus ?? 400 }
      )
    }
    if (href.includes('/uploads/bulk')) {
      const body = JSON.parse(String(init?.body)) as { uploads: unknown[] }
      return new Response(JSON.stringify({
        requested: body.uploads.length,
        created: 0,
        failed: body.uploads.length,
        // `status` is omitted unless the test supplies one, so the default
        // cases exercise the MESSAGE fallback path.
        uploads: body.uploads.map((_, index) => ({
          index,
          ok: false,
          error: opts.bulkError ?? '',
          ...(opts.bulkStatus === undefined ? {} : { status: opts.bulkStatus })
        }))
      }), { status: 200 })
    }
    return new Response('{}', { status: 200 })
  }) as typeof fetch
}

const mkEngine = (store: MemoryStore): UploadEngine =>
  new UploadEngine(
    { ingestBaseUrl: 'http://ingest.test', signCoalesceMs: 10, maxConcurrentUploads: 0 as never },
    store,
    fileSource,
    async () => 'token',
    async () => ({ timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'abc' })
  )

/**
 * Run one item through the sign path and return its settled row.
 *
 * A retryable sign failure returns the item to `ready` (so it can be re-signed)
 * — which is also a state it passes through BEFORE signing. Waiting on `ready`
 * alone would therefore return before the sign call ever happened and make the
 * assertions vacuous. So for the multipart path we additionally require that a
 * sign attempt was actually observed.
 */
const signOne = async (store: MemoryStore, fileSizeBytes: number): Promise<UploadItem | undefined> => {
  const engine = mkEngine(store)
  const isMultipart = fileSizeBytes >= MULTIPART_THRESHOLD_BYTES
  const item = createUploadItem({
    filename: 'f_20260101_000000.wav',
    relativePath: 'f.wav',
    fileSizeBytes,
    streamId: 's1'
  })
  await engine.enqueue([item])
  engine.start()

  const deadline = Date.now() + 4000
  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 25))
    const row = await store.get(item.id)
    if (row === undefined) continue
    if (['rejected', 'failed', 'duplicate'].includes(row.state)) break
    if (isMultipart && signAttempts.multipart > 0 && row.state === 'ready') break
  }
  await engine.pause()
  return await store.get(item.id)
}

describe('bulk sign — permanent rejections are NOT offered as retries', () => {
  test.each([
    'Audio duration is more than 24 hours',
    'Project is view-only and cannot accept uploads.',
    'Project recording-minute limit exceeded.',
    'This wav file size is exceeding our limit (200MB)',
    'Future date upload: 2030-01-01T00:00:00Z',
    'Past date upload: 1600-01-01T00:00:00Z (before 1800, which is not a plausible recording date)'
  ])('%s → rejected', async (message) => {
    mockSignEndpoints({ bulkError: message })
    const store = new MemoryStore()
    const row = await signOne(store, 10)

    expect(row?.state).toBe('rejected')
    expect(row?.retryable).not.toBe(true)
    expect(row?.error).toBe(message)
  })

  test.each([
    'Internal server error',
    'Service Unavailable',
    'connection reset by peer'
  ])('%s → stays retryable (transient)', async (message) => {
    mockSignEndpoints({ bulkError: message })
    const store = new MemoryStore()
    const row = await signOne(store, 10)

    expect(row?.state).toBe('failed')
    expect(row?.retryable).toBe(true)
  })
})

describe('bulk sign — per-item status is preferred over the message', () => {
  test('400 with an UNKNOWN message → rejected (status beats the word list)', async () => {
    mockSignEndpoints({ bulkStatus: 400, bulkError: 'A brand-new validation rule nobody listed' })
    const store = new MemoryStore()
    const row = await signOne(store, 10)

    expect(row?.state).toBe('rejected')
  })

  test('500 → retryable, even though the message looks permanent', async () => {
    // Guards the mirror defect: a transient server fault that happens to carry
    // permanent-sounding wording must NOT strand the file.
    mockSignEndpoints({ bulkStatus: 500, bulkError: 'Audio duration is more than 24 hours' })
    const store = new MemoryStore()
    const row = await signOne(store, 10)

    expect(row?.state).toBe('failed')
    expect(row?.retryable).toBe(true)
  })

  test('403 → NOT rejected (an expired/insufficient token can be re-granted)', async () => {
    // Deliberate call, consistent with the multipart path: 403 is treated as
    // recoverable rather than a verdict on the FILE. The user may re-auth or
    // have permission granted, after which the identical request succeeds.
    // Stranding the row would be unrecoverable; offering a retry is not.
    mockSignEndpoints({ bulkStatus: 403, bulkError: 'Forbidden' })
    const store = new MemoryStore()
    const row = await signOne(store, 10)

    expect(row?.state).not.toBe('rejected')
  })
})

describe('multipart sign — classified by HTTP status', () => {
  const big = MULTIPART_THRESHOLD_BYTES + 1

  test('400 with an UNKNOWN message → rejected (status beats the word list)', async () => {
    mockSignEndpoints({ multipartStatus: 400, multipartMessage: 'A brand-new rule nobody listed' })
    const store = new MemoryStore()
    const row = await signOne(store, big)

    expect(row?.state).toBe('rejected')
  })

  test.each([
    [401, 'Unauthorized'],
    [403, 'Forbidden'],
    [408, 'Request Timeout'],
    [429, 'Too Many Requests'],
    [500, 'Internal server error'],
    [503, 'Service Unavailable']
  ])('%i → returned to ready, re-signable (auth/transient stay retryable)', async (status, message) => {
    mockSignEndpoints({ multipartStatus: status, multipartMessage: message })
    const store = new MemoryStore()
    const row = await signOne(store, big)

    // Assert the POSITIVE state, not merely "not rejected" — a plain negative
    // would also pass if the item never reached the sign call at all.
    expect(signAttempts.multipart).toBeGreaterThan(0)
    expect(row?.state).toBe('ready')
  })
})
