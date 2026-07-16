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
import { type BulkSignRequestItem, type FileSource, type QueueStats, type TokenProvider, type UploadEngineConfig, type UploadEngineEvent, type UploadEngineListener, type UploadItem, type UploadStore, SERVER_STATUS } from './types'

const DEFAULTS = {
  maxConcurrentUploads: 4,
  maxConcurrentPrepares: 2,
  signBatchSize: 100,
  statusBatchSize: 100,
  maxAttempts: 5,
  retryBaseDelayMs: 2000,
  retryMaxDelayMs: 60_000,
  statusPollIntervalMs: 5000,
  signedUrlMaxAgeMs: 20 * 60 * 60 * 1000
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
  private readonly listeners = new Set<UploadEngineListener>()
  private running = false
  private online = true
  private loopTimer: ReturnType<typeof setTimeout> | undefined
  private statusTimer: ReturnType<typeof setTimeout> | undefined
  private activeUploads = 0
  private activePrepares = 0
  private signingInFlight = false
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

  start (): void {
    if (this.running) return
    this.running = true
    this.emit({ type: 'engine-state', running: true, online: this.online })
    this.kick()
    this.scheduleStatusPoll()
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

  /** Retry a failed item (resets attempts). */
  async retry (itemId: string): Promise<void> {
    const item = await this.store.get(itemId)
    if (item === undefined) return
    if (item.state !== 'failed' && item.state !== 'rejected') return
    await this.update(item, {
      state: item.checksumSha1 !== undefined ? 'ready' : 'queued',
      attempts: 0,
      error: undefined,
      uploadId: undefined,
      signedUrl: undefined
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
    const items = await this.store.list(['queued', 'ready', 'signed'])
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
      const [next] = await this.store.list(['queued'])
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
        error: 'File handle lost — re-add this file.'
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
        sampleRateHz: result.sampleRateHz
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
    const ready = await this.store.list(['ready'])
    // Also re-sign stale signed URLs.
    const signed = await this.store.list(['signed'])
    const stale = signed.filter(
      item =>
        item.signedAtMs !== undefined &&
        Date.now() - item.signedAtMs > this.config.signedUrlMaxAgeMs
    )
    const batch = [...ready, ...stale].slice(0, this.config.signBatchSize)
    if (batch.length === 0) return

    this.signingInFlight = true
    try {
      const marked: UploadItem[] = []
      for (const item of batch) {
        marked.push(await this.update(item, { state: 'signing' }))
      }
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
      // Whole-batch failure (auth/network/5xx): return items to ready.
      const message = err instanceof Error ? err.message : String(err)
      const signingItems = await this.store.list(['signing'])
      for (const item of signingItems) {
        await this.update(item, { state: 'ready' })
      }
      this.emit({ type: 'error', message: `Signing batch failed: ${message}` })
    } finally {
      this.signingInFlight = false
    }
  }

  private async pumpUploads (): Promise<void> {
    while (this.activeUploads < this.config.maxConcurrentUploads) {
      const signed = await this.store.list(['signed'])
      const next = signed.find(item => !this.abortControllers.has(item.id))
      if (next === undefined) return
      const item = await this.update(next, { state: 'uploading', progress: 0 })
      this.activeUploads++
      void this.uploadOne(item).finally(() => {
        this.activeUploads--
        this.kick()
      })
    }
  }

  private async uploadOne (item: UploadItem): Promise<void> {
    const file = await this.fileSource.getFile(item.id)
    if (file === undefined || item.signedUrl === undefined) {
      await this.update(item, {
        state: 'rejected',
        error: 'File handle lost — re-add this file.'
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
        attempts: item.attempts + 1
      })
      this.scheduleStatusPoll()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
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

  // -- server status polling -------------------------------------------------

  private scheduleStatusPoll (): void {
    if (this.statusTimer !== undefined) return
    this.statusTimer = setTimeout(() => {
      this.statusTimer = undefined
      void this.pollStatuses()
    }, this.config.statusPollIntervalMs)
  }

  private async pollStatuses (): Promise<void> {
    const uploaded = await this.store.list(['uploaded'])
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
    const remaining = await this.store.list(['uploaded'])
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
