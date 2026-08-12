/**
 * UploadEngine — the pipeline orchestrator.
 *
 * queued → preparing → ready → signing → signed → uploading → uploaded → ingested
 *                                  ↘ rejected            ↘ failed (retryable → back to ready/signed)
 *
 * Design notes (mirrors runbooks/DESIGN-browser-bulk-uploader-2026-07-16.md §3.2):
 * - All state persists via the injected UploadStore (IndexedDB in browser),
 *   so a closed tab resumes exactly where it left off.
 * - Signing is batched (server cap 100/request) and pipelined ahead of the
 *   upload pool. Per-item signing failures (Duplicate./limits) surface as
 *   item-level outcomes without failing the batch.
 * - Uploads run in a bounded concurrent pool with exponential backoff+jitter
 *   retries. Signed URLs older than signedUrlMaxAgeMs are re-signed.
 * - A status poller batch-polls /uploads/status until items are terminal.
 * - online/offline transitions pause/resume the pool automatically.
 */

import { IngestApi, putToSignedUrl } from './ingest-api'
import { sha1HexOfBlob } from './sha1'
import { MULTIPART_THRESHOLD_BYTES, MultipartApi, uploadParts } from './multipart'
import { type BulkSignRequestItem, type FileSource, type QueueStats, type TokenProvider, type UploadEngineConfig, type UploadEngineEvent, type UploadEngineListener, type UploadItem, type UploadItemState, type UploadStore, SERVER_STATUS } from './types'

const DEFAULTS = {
  maxConcurrentUploads: 4,
  maxConcurrentPrepares: 2,
  signBatchSize: 100,
  signCoalesceMs: 750,
  statusBatchSize: 100,
  maxAttempts: 5,
  retryBaseDelayMs: 2000,
  retryMaxDelayMs: 60_000,
  statusPollIntervalMs: 5000,
  signedUrlMaxAgeMs: 20 * 60 * 60 * 1000,
  multipartThresholdBytes: MULTIPART_THRESHOLD_BYTES,
  multipartPartConcurrency: 3
} as const

/** Signing errors that must not be retried (item-level rejections). */
const NON_RETRYABLE_SIGN_ERRORS = [
  /^Duplicate\.$/,
  /^Invalid\.$/,
  /Future date/,
  /Past date/,
  /limit exceeded/i,
  /view-only/i,
  /exceeding our limit/i,
  /Validation errors/
]

export interface PrepareResult {
  timestampUtc?: string
  checksumSha1?: string
  durationMs?: number
  sampleRateHz?: number
  error?: string
  /**
   * Set when the prepare stage transcoded the file (#112 client-side FLAC):
   * the name+size the SERVER must see — signing and PUT use the encoded
   * bytes, so filename/extension/fileSize must describe them, not the source.
   */
  transcodedFilename?: string
  transcodedSizeBytes?: number
}

/** Shell-provided prepare step (browser: worker w/ sha1+header parse). */
export type PrepareFn = (item: UploadItem, file: Blob) => Promise<PrepareResult>

export class UploadEngine {
  private async emitStats (): Promise<void> {
    this.emit({ type: 'stats', stats: await this.stats() })
  }

  private readonly config: Required<Omit<UploadEngineConfig, 'laneTier'>> &
    Pick<UploadEngineConfig, 'laneTier'>

  private readonly api: IngestApi
  private readonly multipartApi: MultipartApi
  private readonly multipartSigning = new Set<string>()
  private readonly listeners = new Set<UploadEngineListener>()
  private running = false
  private online = true
  private loopTimer: ReturnType<typeof setTimeout> | undefined
  private statusTimer: ReturnType<typeof setTimeout> | undefined
  private activeUploads = 0
  private activePrepares = 0
  private signingInFlight = false
  // Sign-coalescing (2026-08-12): without it, prepares trickle items to
  // `ready` 1-2 at a time and every pump fires a tiny /uploads/bulk call —
  // a 100-file batch became ~50 SERIAL round trips (the "Waiting for URL"
  // bottleneck). We hold signing for a short flush window while more items
  // are clearly coming, then send one big batch.
  private signFlushTimer: ReturnType<typeof setTimeout> | undefined
  private signFlushForced = false
  // Whole-batch sign failures previously re-pumped with NO backoff — a
  // fast-failing endpoint (proxy timeout, rate limit) produced a tight
  // fire-fail-refire loop (observed live 2026-08-12: 30+ bulk calls/10s).
  private signFailureStreak = 0
  private signBackoffUntil = 0
  // Multi-window queue partitioning (2026-08-12): the queue (IndexedDB) is
  // shared by every window of the origin, but each window runs its OWN
  // engine. Without a scope, two windows double-drive the same items (the
  // original popout design paused the opener wholesale). A scope predicate
  // restricts WHICH items this engine instance will pump/recover/poll — a
  // project pop-out scopes to its project; the main window excludes projects
  // that have live pop-outs. Terminal/UI reads are NOT scoped (every window
  // may render everything); only the driving loops are.
  private scope: (item: UploadItem) => boolean = () => true

  /** Restrict which items this engine instance drives (see field note). */
  setScope (predicate: ((item: UploadItem) => boolean) | undefined): void {
    this.scope = predicate ?? (() => true)
    this.kick()
  }

  private async listScoped (states: UploadItemState[]): Promise<UploadItem[]> {
    return (await this.store.list(states)).filter(this.scope)
  }
  private readonly abortControllers = new Map<string, AbortController>()

  constructor (
    config: UploadEngineConfig,
    private readonly store: UploadStore,
    private readonly fileSource: FileSource,
    tokenProvider: TokenProvider,
    private readonly prepare: PrepareFn
  ) {
    this.config = { ...DEFAULTS, ...config }
    this.api = new IngestApi(config.ingestBaseUrl, tokenProvider)
    this.multipartApi = new MultipartApi(config.ingestBaseUrl, tokenProvider)
  }

  // -- public API -----------------------------------------------------------

  on (listener: UploadEngineListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Add files to the queue (they persist immediately). */
  async enqueue (items: UploadItem[]): Promise<void> {
    await this.store.putMany(items)
    for (const item of items) this.emit({ type: 'item-updated', item })
    await this.emitStats()
    this.kick()
  }

  /**
   * Staged intake: persist items WITHOUT entering the upload pipeline.
   * The shell runs its local analysis (analyze step) and the user releases
   * items explicitly via startStaged(). Items arrive as `analyzing` or
   * `staged` — the pump ignores both states.
   */
  async stage (items: UploadItem[]): Promise<void> {
    await this.store.putMany(items)
    for (const item of items) this.emit({ type: 'item-updated', item })
    await this.emitStats()
  }

  /** Persist an analysis update to a staged item (shell-driven). */
  async updateStaged (itemId: string, patch: Partial<UploadItem>): Promise<void> {
    const item = await this.store.get(itemId)
    if (item === undefined) return
    await this.update(item, patch)
    await this.emitStats()
  }

  /**
   * Release staged items into the pipeline. Items with an analysisError are
   * skipped — they cannot produce a valid sign request. PRESTAGED items
   * (checksum + signed URL already obtained in the background) fast-track
   * straight to `signed` — the upload pool picks them up immediately;
   * everything else enters at `queued` (prepare → sign as before).
   * Pass ids to release a selection; omit to release all staged items.
   * Returns the number released.
   */
  async startStaged (ids?: string[]): Promise<number> {
    const staged = await this.listScoped(['staged'])
    const idSet = ids === undefined ? undefined : new Set(ids)
    let released = 0
    for (const item of staged) {
      if (idSet !== undefined && !idSet.has(item.id)) continue
      if (item.analysisError !== undefined) continue
      const fastTrack = item.signedUrl !== undefined && item.checksumSha1 !== undefined
      await this.update(item, { state: fastTrack ? 'signed' : 'queued' })
      released++
    }
    if (released > 0) {
      await this.emitStats()
      this.kick()
    }
    return released
  }

  /**
   * Background prestage (2026-08-12, operator design): for STAGED files that
   * will upload as-is (non-WAV — never transcoded), compute the sha1 and
   * request the signed URL while the queue is still parked. Because signing
   * IS the server's dedup check, will-be-duplicate rows get their verdict
   * immediately (→ terminal `duplicate`, independent of Start), and Start
   * fast-tracks prestaged rows straight into the upload pool.
   *
   * Deliberately conservative:
   * - WAVs are NEVER prestaged (encoding must not begin before Start, and
   *   the FLAC toggle can change; enforced here, not just at the call site)
   * - multipart-sized files keep the normal path
   * - non-retryable sign errors surface as analysisError (visible, excluded
   *   from Start); retryable/network failures leave the item untouched —
   *   the normal Start path remains the safety net
   * - each result re-reads the stored item and only applies while it is
   *   STILL staged (the user may have started/cancelled/removed mid-flight)
   */
  async prestage (ids: string[]): Promise<number> {
    const eligible: UploadItem[] = []
    for (const id of ids) {
      const item = await this.store.get(id)
      if (item === undefined) continue
      if (item.state !== 'staged') continue
      if (item.analysisError !== undefined) continue
      if (item.timestampUtc === undefined) continue
      if (item.signedUrl !== undefined) continue
      if (item.filename.toLowerCase().endsWith('.wav')) continue
      if (item.fileSizeBytes >= this.config.multipartThresholdBytes) continue
      eligible.push(item)
    }
    if (eligible.length === 0) return 0

    // hash with bounded concurrency (async WebCrypto — cheap but not free)
    const hashed: UploadItem[] = []
    let cursor = 0
    await Promise.all(Array.from({ length: Math.min(2, eligible.length) }, async () => {
      while (cursor < eligible.length) {
        const item = eligible[cursor++]
        if (item.checksumSha1 !== undefined) { hashed.push(item); continue }
        const file = await this.fileSource.getFile(item.id)
        if (file === undefined) continue
        try {
          const checksumSha1 = await sha1HexOfBlob(file)
          hashed.push(await this.update(item, { checksumSha1 }))
        } catch { /* unreadable — leave for the normal path */ }
      }
    }))
    if (hashed.length === 0) return 0

    let prestaged = 0
    for (let offset = 0; offset < hashed.length; offset += this.config.signBatchSize) {
      const batch = hashed.slice(offset, offset + this.config.signBatchSize)
      try {
        const request: BulkSignRequestItem[] = batch.map(item => ({
          filename: item.filename,
          timestamp: item.timestampUtc as string,
          stream: item.streamId,
          duration: item.durationMs !== undefined && item.durationMs > 0 ? Math.round(item.durationMs) : undefined,
          fileSize: item.fileSizeBytes,
          sampleRate: item.sampleRateHz,
          checksum: item.checksumSha1
        }))
        const response = await this.api.signBulk(request, this.config.laneTier)
        for (const result of response.uploads) {
          const item = batch[result.index]
          if (item === undefined) continue
          const current = await this.store.get(item.id)
          if (current === undefined || current.state !== 'staged') continue
          if (result.ok && result.uploadId !== undefined && result.url !== undefined) {
            await this.update(current, {
              uploadId: result.uploadId,
              signedUrl: result.url,
              signedAtMs: Date.now()
            })
            prestaged++
          } else {
            const message = result.error ?? ''
            if (message === 'Duplicate.') {
              await this.update(current, { state: 'duplicate', error: undefined })
            } else if (NON_RETRYABLE_SIGN_ERRORS.some(pattern => pattern.test(message))) {
              await this.update(current, { analysisError: message })
            }
            // retryable → untouched; the normal path covers it at Start
          }
        }
      } catch { /* whole-batch failure — items stay staged; normal path covers */ }
    }
    await this.emitStats()
    return prestaged
  }

  /**
   * Per-item pause: return pipeline items (queued/preparing/ready/signing/
   * signed/uploading) to `staged`, aborting any in-flight PUT and discarding
   * sign/multipart context. The complement of startStaged — a bulk "Pause"
   * for a selection, without touching the global engine or other items.
   * Items past the PUT (uploaded/terminal) are left alone. Returns count.
   */
  async pauseItems (ids: string[]): Promise<number> {
    let paused = 0
    for (const id of ids) {
      const item = await this.store.get(id)
      if (item === undefined) continue
      if (!['queued', 'preparing', 'ready', 'signing', 'signed', 'uploading'].includes(item.state)) continue
      this.abortControllers.get(id)?.abort()
      await this.update(item, {
        state: 'staged',
        progress: undefined,
        uploadId: undefined,
        signedUrl: undefined,
        multipart: undefined,
        error: undefined
      })
      paused++
    }
    if (paused > 0) await this.emitStats()
    return paused
  }

  /**
   * Cancel an item: terminal `cancelled` (failed-like — NO automatic
   * re-stage; Retry re-enters the pipeline explicitly). In-flight PUTs are
   * aborted; signed/multipart context is discarded so a later Retry signs
   * fresh. Terminal items (ingested/duplicate) are left untouched.
   */
  async cancel (itemId: string): Promise<void> {
    const item = await this.store.get(itemId)
    if (item === undefined) return
    if (['ingested', 'duplicate', 'failed', 'rejected', 'cancelled'].includes(item.state)) return
    this.abortControllers.get(itemId)?.abort()
    await this.update(item, {
      state: 'cancelled',
      progress: undefined,
      uploadId: undefined,
      signedUrl: undefined,
      multipart: undefined,
      error: 'Cancelled by user.'
    })
    await this.emitStats()
  }

  start (): void {
    if (this.running) return
    this.running = true
    this.emit({ type: 'engine-state', running: true, online: this.online })
    // Recover items orphaned by a hard interruption (tab close / crash /
    // network drop that killed an in-flight PUT) BEFORE pumping. Without this
    // they sit in `uploading`/`signing` forever: pumpUploads() only ever picks
    // up `signed`, and nothing else moves them. Measured in production
    // (2026-08-03): a mid-batch network failure left thousands of uploads
    // signed server-side with bytes never sent, and the queue never resumed.
    void this.recoverStalled().then(() => {
      this.kick()
    })
    this.scheduleStatusPoll()
  }

  /**
   * Return items stranded in a transient in-flight state to the pool.
   *
   * `uploading` -> `signed` (re-PUT; the signed URL is reused when fresh,
   *                and pumpSigning() re-signs it when stale)
   * `signing`   -> `ready`  (re-request a URL)
   * `preparing` -> `queued` (re-hash)
   *
   * Only touches items NOT currently owned by a live in-flight operation, so
   * calling it mid-run is safe. Returns the number of items recovered.
   */
  async recoverStalled (): Promise<number> {
    const stranded = await this.listScoped(['uploading', 'signing', 'preparing'])
    let recovered = 0
    for (const item of stranded) {
      if (this.abortControllers.has(item.id)) continue
      if (this.multipartSigning.has(item.id)) continue
      const state =
        item.state === 'uploading'
          ? 'signed'
          : item.state === 'signing'
            ? 'ready'
            : 'queued'
      await this.update(item, { state, progress: undefined })
      recovered++
    }
    if (recovered > 0) {
      await this.emitStats()
      this.kick()
    }
    return recovered
  }

  /** Pause new work; in-flight PUTs are aborted back to `signed`. */
  async pause (): Promise<void> {
    this.running = false
    for (const controller of this.abortControllers.values()) controller.abort()
    this.emit({ type: 'engine-state', running: false, online: this.online })
    await this.emitStats()
  }

  setOnline (online: boolean): void {
    this.online = online
    this.emit({ type: 'engine-state', running: this.running, online })
    if (online) this.kick()
  }

  /** Retry a failed/rejected/cancelled item (resets attempts). */
  async retry (itemId: string): Promise<void> {
    const item = await this.store.get(itemId)
    if (item === undefined) return
    if (item.state !== 'failed' && item.state !== 'rejected' && item.state !== 'cancelled') return
    // Transcoded items must go back through prepare: their encoded blob was
    // released at the terminal state, and the fileSource would serve the
    // ORIGINAL bytes under the FLAC identity → guaranteed checksum mismatch.
    const rewindTranscode = item.transcoded === true
    await this.update(item, {
      state: !rewindTranscode && item.checksumSha1 !== undefined ? 'ready' : 'queued',
      attempts: 0,
      error: undefined,
      uploadId: undefined,
      signedUrl: undefined,
      multipart: undefined,
      ...(rewindTranscode
        ? {
            filename: item.originalFilename ?? item.filename,
            fileSizeBytes: item.originalFileSizeBytes ?? item.fileSizeBytes,
            transcoded: undefined,
            checksumSha1: undefined
          }
        : {})
    })
    this.kick()
  }

  async remove (itemId: string): Promise<void> {
    this.abortControllers.get(itemId)?.abort()
    await this.store.delete(itemId)
    await this.emitStats()
  }

  async stats (): Promise<QueueStats> {
    const items = await this.store.list()
    const stats: QueueStats = {
      total: items.length,
      analyzing: 0,
      staged: 0,
      queued: 0,
      preparing: 0,
      ready: 0,
      signing: 0,
      signed: 0,
      uploading: 0,
      uploaded: 0,
      ingested: 0,
      duplicate: 0,
      failed: 0,
      rejected: 0,
      cancelled: 0,
      paused: 0,
      bytesTotal: 0,
      bytesUploaded: 0
    }
    for (const item of items) {
      stats[item.state]++
      stats.bytesTotal += item.fileSizeBytes
      if (
        item.state === 'uploaded' ||
        item.state === 'ingested' ||
        item.state === 'duplicate'
      ) {
        stats.bytesUploaded += item.fileSizeBytes
      } else if (item.state === 'uploading' && item.progress !== undefined) {
        stats.bytesUploaded += Math.floor(item.fileSizeBytes * item.progress)
      }
    }
    return stats
  }

  // -- internals ------------------------------------------------------------

  private emit (event: UploadEngineEvent): void {
    for (const listener of this.listeners) listener(event)
  }

  private async update (
    item: UploadItem,
    patch: Partial<UploadItem>
  ): Promise<UploadItem> {
    const updated: UploadItem = { ...item, ...patch, updatedAtMs: Date.now() }
    await this.store.put(updated)
    this.emit({ type: 'item-updated', item: updated })
    return updated
  }

  /** Schedule a pump pass (debounced via microtask-ish timer). */
  private kick (): void {
    if (this.loopTimer !== undefined) return
    this.loopTimer = setTimeout(() => {
      this.loopTimer = undefined
      void this.pump()
    }, 25)
  }

  /** One pump pass: fill prepare pool, fire a sign batch, fill upload pool. */
  private async pump (): Promise<void> {
    if (!this.running || !this.online) return
    try {
      await Promise.all([
        this.pumpPrepares(),
        this.pumpSigning(),
        this.pumpUploads()
      ])
    } catch (err) {
      this.emit({
        type: 'error',
        message: err instanceof Error ? err.message : String(err)
      })
    }
    await this.emitStats()
    // Keep pumping while there is actionable work.
    const items = await this.listScoped(['queued', 'ready', 'signed'])
    if (
      items.length > 0 &&
      (this.activePrepares < this.config.maxConcurrentPrepares ||
        this.activeUploads < this.config.maxConcurrentUploads ||
        !this.signingInFlight)
    ) {
      this.kick()
    }
  }

  private async pumpPrepares (): Promise<void> {
    while (this.activePrepares < this.config.maxConcurrentPrepares) {
      const [next] = await this.listScoped(['queued'])
      if (next === undefined) return
      const item = await this.update(next, { state: 'preparing' })
      this.activePrepares++
      void this.prepareOne(item).finally(() => {
        this.activePrepares--
        this.kick()
      })
    }
  }

  private async prepareOne (item: UploadItem): Promise<void> {
    const file = await this.fileSource.getFile(item.id)
    if (file === undefined) {
      await this.update(item, {
        state: 'rejected',
        error: 'Session interrupted — re-add this folder to resume (already-uploaded files are skipped).'
      })
      return
    }
    try {
      const result = await this.prepare(item, file)
      if (result.error !== undefined || result.timestampUtc === undefined) {
        await this.update(item, {
          state: 'rejected',
          error:
            result.error ??
            'Could not parse a recording timestamp from the filename.'
        })
        return
      }
      await this.update(item, {
        state: 'ready',
        timestampUtc: result.timestampUtc,
        checksumSha1: result.checksumSha1,
        durationMs: result.durationMs,
        sampleRateHz: result.sampleRateHz,
        // client-side transcode (#112): from here on the item describes the
        // ENCODED file — the server signs/receives those bytes. The original
        // name survives in relativePath for the UI.
        ...(result.transcodedFilename !== undefined
          ? {
              filename: result.transcodedFilename,
              fileSizeBytes: result.transcodedSizeBytes,
              transcoded: true,
              // keep the pre-transcode identity for retry-after-terminal:
              // the encoded blob is cache-released at terminal states, so a
              // retry must re-enter prepare (re-encode), not reuse FLAC
              // identity over WAV bytes.
              originalFilename: item.filename,
              originalFileSizeBytes: item.fileSizeBytes
            }
          : {})
      })
    } catch (err) {
      await this.update(item, {
        state: 'rejected',
        error: err instanceof Error ? err.message : String(err)
      })
    }
  }

  private async pumpSigning (): Promise<void> {
    if (this.signingInFlight) return
    if (Date.now() < this.signBackoffUntil) return // batch-failure backoff
    const readyAll = await this.listScoped(['ready'])
    // Large files take the multipart path (individually signed).
    const readyMultipart = readyAll.filter(item => item.fileSizeBytes >= this.config.multipartThresholdBytes)
    for (const item of readyMultipart) {
      void this.signMultipartOne(item)
    }
    const ready = readyAll.filter(item => item.fileSizeBytes < this.config.multipartThresholdBytes)
    // Also re-sign stale signed URLs.
    const signed = await this.listScoped(['signed'])
    const stale = signed.filter(
      item =>
        item.signedAtMs !== undefined &&
        Date.now() - item.signedAtMs > this.config.signedUrlMaxAgeMs &&
        item.multipart === undefined
    )
    const batch = [...ready, ...stale].slice(0, this.config.signBatchSize)
    if (batch.length === 0) return

    // COALESCE: if the batch isn't full and the prepare pool is still
    // feeding (queued/preparing items exist), wait signCoalesceMs for more
    // to accumulate instead of burning a round trip on 1-2 items. The timer
    // guarantees progress — when it fires we sign whatever we have.
    if (!this.signFlushForced && batch.length < this.config.signBatchSize) {
      const feeding = this.activePrepares > 0 ||
        (await this.listScoped(['queued', 'preparing'])).length > 0
      if (feeding) {
        if (this.signFlushTimer === undefined) {
          this.signFlushTimer = setTimeout(() => {
            this.signFlushTimer = undefined
            this.signFlushForced = true
            this.kick()
          }, this.config.signCoalesceMs)
        }
        return
      }
    }
    this.signFlushForced = false
    if (this.signFlushTimer !== undefined) {
      clearTimeout(this.signFlushTimer)
      this.signFlushTimer = undefined
    }

    this.signingInFlight = true
    try {
      // Mark the whole batch `signing` in ONE store write (100 sequential
      // awaits added real latency before the request even fired).
      const now = Date.now()
      const marked: UploadItem[] = batch.map(item => ({ ...item, state: 'signing' as const, updatedAtMs: now }))
      await this.store.putMany(marked)
      for (const item of marked) this.emit({ type: 'item-updated', item })
      const request: BulkSignRequestItem[] = marked.map(item => ({
        filename: item.filename,
        timestamp: item.timestampUtc as string,
        stream: item.streamId,
        duration:
          item.durationMs !== undefined && item.durationMs > 0
            ? Math.round(item.durationMs)
            : undefined,
        fileSize: item.fileSizeBytes,
        sampleRate: item.sampleRateHz,
        checksum: item.checksumSha1
      }))
      const response = await this.api.signBulk(request, this.config.laneTier)
      this.signFailureStreak = 0
      this.signBackoffUntil = 0
      for (const result of response.uploads) {
        const item = marked[result.index]
        if (item === undefined) continue
        if (
          result.ok &&
          result.uploadId !== undefined &&
          result.url !== undefined
        ) {
          await this.update(item, {
            state: 'signed',
            uploadId: result.uploadId,
            signedUrl: result.url,
            signedAtMs: Date.now()
          })
        } else {
          const message = result.error ?? 'Signing failed.'
          if (message === 'Duplicate.') {
            await this.update(item, { state: 'duplicate', error: undefined })
          } else if (
            NON_RETRYABLE_SIGN_ERRORS.some(pattern => pattern.test(message))
          ) {
            await this.update(item, { state: 'rejected', error: message })
          } else {
            await this.update(item, {
              state: 'failed',
              retryable: true,
              error: message
            })
          }
        }
      }
    } catch (err) {
      // Whole-batch failure (auth/network/5xx): return items to ready, with
      // exponential backoff before the next attempt (same curve as uploads).
      const message = err instanceof Error ? err.message : String(err)
      const signingItems = await this.listScoped(['signing'])
      for (const item of signingItems) {
        await this.update(item, { state: 'ready' })
      }
      this.signFailureStreak++
      const delay = Math.min(
        this.config.retryMaxDelayMs,
        this.config.retryBaseDelayMs * 2 ** (this.signFailureStreak - 1)
      ) * (0.5 + Math.random())
      this.signBackoffUntil = Date.now() + delay
      this.emit({ type: 'error', message: `Signing batch failed: ${message} (retrying in ${Math.round(delay / 1000)}s)` })
      setTimeout(() => { this.kick() }, delay)
    } finally {
      this.signingInFlight = false
    }
  }

  private async pumpUploads (): Promise<void> {
    while (this.activeUploads < this.config.maxConcurrentUploads) {
      const signed = await this.listScoped(['signed'])
      const next = signed.find(item => !this.abortControllers.has(item.id))
      if (next === undefined) return
      const item = await this.update(next, { state: 'uploading', progress: 0, uploadStartedAtMs: Date.now(), uploadEndedAtMs: undefined })
      this.activeUploads++
      void this.uploadOne(item).finally(() => {
        this.activeUploads--
        this.kick()
      })
    }
  }

  /** Sign one large file for multipart (individual call; not batched). */
  private async signMultipartOne (item: UploadItem): Promise<void> {
    if (this.multipartSigning.has(item.id)) return
    this.multipartSigning.add(item.id)
    try {
      const marked = await this.update(item, { state: 'signing' })
      const descriptor = await this.multipartApi.create({
        filename: marked.filename,
        timestamp: marked.timestampUtc as string,
        stream: marked.streamId,
        duration: marked.durationMs !== undefined && marked.durationMs > 0 ? Math.round(marked.durationMs) : undefined,
        fileSize: marked.fileSizeBytes,
        sampleRate: marked.sampleRateHz,
        checksum: marked.checksumSha1
      })
      await this.update(marked, {
        state: 'signed',
        uploadId: descriptor.uploadId,
        signedAtMs: Date.now(),
        multipart: {
          multipartUploadId: descriptor.multipartUploadId,
          partSizeBytes: descriptor.partSizeBytes,
          partCount: descriptor.partCount,
          partUrls: descriptor.partUrls,
          completedParts: []
        }
      })
      this.kick()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message === 'Duplicate.') {
        await this.update(item, { state: 'duplicate', error: undefined })
      } else if (NON_RETRYABLE_SIGN_ERRORS.some(pattern => pattern.test(message))) {
        await this.update(item, { state: 'rejected', error: message })
      } else {
        await this.update(item, { state: 'ready', error: message })
      }
    } finally {
      this.multipartSigning.delete(item.id)
    }
  }

  private async uploadOne (item: UploadItem): Promise<void> {
    if (item.multipart !== undefined) {
      await this.uploadMultipartOne(item)
      return
    }
    const file = await this.fileSource.getFile(item.id)
    if (file === undefined || item.signedUrl === undefined) {
      await this.update(item, {
        state: 'rejected',
        error: 'Session interrupted — re-add this folder to resume (already-uploaded files are skipped).'
      })
      return
    }
    const controller = new AbortController()
    this.abortControllers.set(item.id, controller)
    const extension = item.filename.split('.').pop()?.toLowerCase() ?? 'flac'
    let lastPersistedProgress = 0
    try {
      await putToSignedUrl(
        item.signedUrl,
        file,
        `audio/${extension}`,
        progressEvent => {
          const progress =
            progressEvent.totalBytes > 0
              ? progressEvent.loadedBytes / progressEvent.totalBytes
              : 0
          item.progress = progress
          // Persist sparsely (every ~10%) to avoid IndexedDB write storms.
          if (progress - lastPersistedProgress >= 0.1) {
            lastPersistedProgress = progress
            void this.update(item, { progress })
          } else {
            this.emit({ type: 'item-updated', item: { ...item, progress } })
          }
        },
        controller.signal
      )
      await this.update(item, {
        state: 'uploaded',
        progress: 1,
        attempts: item.attempts + 1,
        uploadEndedAtMs: Date.now()
      })
      this.scheduleStatusPoll()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // A user cancel() or pauseItems() aborts the PUT and has ALREADY
      // written its state (`cancelled`/`staged`) — the abort landing here
      // must not resurrect the item. Re-read the stored state, respect it.
      const current = await this.store.get(item.id)
      if (current?.state === 'cancelled' || current?.state === 'staged') return
      if (!this.running) {
        // paused → back to signed for a clean resume
        await this.update(item, { state: 'signed', progress: undefined })
        return
      }
      const attempts = item.attempts + 1
      if (attempts >= this.config.maxAttempts) {
        await this.update(item, {
          state: 'failed',
          attempts,
          retryable: true,
          error: message
        })
        return
      }
      const delay =
        Math.min(
          this.config.retryMaxDelayMs,
          this.config.retryBaseDelayMs * 2 ** (attempts - 1)
        ) *
        (0.5 + Math.random())
      await this.update(item, {
        state: 'signed',
        attempts,
        progress: undefined,
        error: message
      })
      setTimeout(() => {
        this.kick()
      }, delay)
    } finally {
      this.abortControllers.delete(item.id)
    }
  }

  /** Multipart upload path: part pool w/ per-part retry, then server complete. */
  private async uploadMultipartOne (item: UploadItem): Promise<void> {
    const file = await this.fileSource.getFile(item.id)
    if (file === undefined || item.multipart === undefined || item.uploadId === undefined) {
      await this.update(item, { state: 'rejected', error: 'Session interrupted — re-add this folder to resume (already-uploaded files are skipped).' })
      return
    }
    const controller = new AbortController()
    this.abortControllers.set(item.id, controller)
    let lastPersistedProgress = 0
    let liveItem = item
    try {
      const completedParts = await uploadParts(file, {
        uploadId: item.uploadId,
        multipartUploadId: item.multipart.multipartUploadId,
        partSizeBytes: item.multipart.partSizeBytes,
        partCount: item.multipart.partCount,
        partUrls: item.multipart.partUrls
      }, {
        partConcurrency: this.config.multipartPartConcurrency,
        maxAttemptsPerPart: this.config.maxAttempts,
        retryBaseDelayMs: this.config.retryBaseDelayMs,
        retryMaxDelayMs: this.config.retryMaxDelayMs,
        completedParts: item.multipart.completedParts,
        abortSignal: controller.signal,
        onProgress: (loadedBytes, totalBytes) => {
          const progress = totalBytes > 0 ? loadedBytes / totalBytes : 0
          liveItem.progress = progress
          if (progress - lastPersistedProgress >= 0.05) {
            lastPersistedProgress = progress
            // Persist progress AND completed-part etags sparsely for resume.
            void this.update(liveItem, { progress })
          } else {
            this.emit({ type: 'item-updated', item: { ...liveItem, progress } })
          }
        }
      })
      // Persist the final part list, then server-side complete (idempotent).
      liveItem = await this.update(liveItem, {
        multipart: { ...item.multipart, completedParts }
      })
      await this.multipartApi.complete(item.uploadId, completedParts)
      await this.update(liveItem, { state: 'uploaded', progress: 1, attempts: item.attempts + 1, uploadEndedAtMs: Date.now() })
      this.scheduleStatusPoll()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // Same cancel/pause-race guard as uploadOne.
      const current = await this.store.get(item.id)
      if (current?.state === 'cancelled' || current?.state === 'staged') return
      if (!this.running) {
        await this.update(liveItem, { state: 'signed', progress: undefined })
        return
      }
      const attempts = item.attempts + 1
      if (attempts >= this.config.maxAttempts) {
        await this.update(liveItem, { state: 'failed', attempts, retryable: true, error: message })
        return
      }
      const delay = Math.min(this.config.retryMaxDelayMs, this.config.retryBaseDelayMs * 2 ** (attempts - 1)) * (0.5 + Math.random())
      await this.update(liveItem, { state: 'signed', attempts, progress: undefined, error: message })
      setTimeout(() => { this.kick() }, delay)
    } finally {
      this.abortControllers.delete(item.id)
    }
  }

  // -- server status polling -------------------------------------------------

  private scheduleStatusPoll (): void {
    if (this.statusTimer !== undefined) return
    this.statusTimer = setTimeout(() => {
      this.statusTimer = undefined
      void this.pollStatuses()
    }, this.config.statusPollIntervalMs)
  }

  private async pollStatuses (): Promise<void> {
    const uploaded = await this.listScoped(['uploaded'])
    if (uploaded.length === 0) return
    const withIds = uploaded.filter(item => item.uploadId !== undefined)
    for (
      let offset = 0;
      offset < withIds.length;
      offset += this.config.statusBatchSize
    ) {
      const batch = withIds.slice(offset, offset + this.config.statusBatchSize)
      try {
        const response = await this.api.getStatuses(
          batch.map(item => item.uploadId as string)
        )
        for (const result of response.uploads) {
          const item = batch[result.index]
          if (item === undefined || !result.ok) continue
          await this.applyServerStatus(
            item,
            result.status,
            result.failureMessage ?? undefined,
            result.retryable
          )
        }
      } catch (err) {
        this.emit({
          type: 'error',
          message: `Status poll failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        })
      }
    }
    await this.emitStats()
    const remaining = await this.listScoped(['uploaded'])
    if (remaining.length > 0) this.scheduleStatusPoll()
  }

  private async applyServerStatus (
    item: UploadItem,
    status?: number,
    failureMessage?: string,
    retryable?: boolean
  ): Promise<void> {
    switch (status) {
      case SERVER_STATUS.INGESTED:
        await this.update(item, { state: 'ingested' })
        break
      case SERVER_STATUS.DUPLICATE:
        await this.update(item, { state: 'duplicate' })
        break
      case SERVER_STATUS.CHECKSUM:
        // retry_upload path: URL may be reused if fresh; reset to ready to re-sign cleanly.
        await this.update(item, {
          state: 'ready',
          uploadId: undefined,
          signedUrl: undefined,
          error: 'Checksum mismatch — re-uploading.'
        })
        this.kick()
        break
      case SERVER_STATUS.FAILED:
        if (retryable === true) {
          await this.update(item, {
            state: 'ready',
            uploadId: undefined,
            signedUrl: undefined,
            error: failureMessage
          })
          this.kick()
        } else {
          await this.update(item, {
            state: 'failed',
            retryable: false,
            error: failureMessage ?? 'Ingest failed.'
          })
        }
        break
      default:
        break // WAITING/UPLOADED → keep polling
    }
  }
}
