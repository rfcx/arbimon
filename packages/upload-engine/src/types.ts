/**
 * Core types for the bulk upload engine.
 *
 * The engine is framework-free and shell-agnostic: the browser app and the
 * (future) desktop shell provide adapters (Store, FileSource, TokenProvider)
 * while the engine owns the pipeline: prepare → sign → upload → track.
 */

/** Lifecycle state of a single file in the local queue. */
export type UploadItemState =
  | 'analyzing' // staged-intake: local header/filename analysis in progress
  | 'staged' // analysis done; awaiting explicit Start (may carry analysisError)
  | 'queued' // accepted into the queue, not yet prepared
  | 'preparing' // hashing / timestamp parsing / duration probing
  | 'ready' // prepared, waiting for a signed URL
  | 'signing' // included in an in-flight /uploads/bulk request
  | 'signed' // has uploadId + signed URL, waiting for an upload slot
  | 'uploading' // PUT in flight
  | 'uploaded' // PUT succeeded; server ingest in progress
  | 'ingested' // terminal: fully ingested (server status 20)
  | 'duplicate' // terminal: server-side sha1 duplicate (status 31)
  | 'failed' // terminal or retryable failure (see `retryable`)
  | 'rejected' // terminal: rejected before/at signing (validation, limits)
  | 'cancelled' // terminal: user-cancelled (failed-like; Retry re-enters the pipeline)
  | 'paused' // user- or engine-paused (offline)

/** Server ingest status codes (Mongo streamuploads.status). */
export const SERVER_STATUS = {
  WAITING: 0,
  UPLOADED: 10,
  INGESTED: 20,
  FAILED: 30,
  DUPLICATE: 31,
  CHECKSUM: 32
} as const

/** How the recording timezone was determined for an item (staged analysis). */
export type TimezoneSource =
  | 'filename-offset' // explicit offset in the filename
  | 'file-metadata' // GUANO / AudioMoth ICMT embedded timestamp
  | 'site-local' // site's IANA timezone applied to a naive filename time
  | 'utc-fallback' // no other rung fired
  | 'forced-site' // user selected Site Local Time
  | 'forced-utc' // user selected UTC
  | 'manual' // user edited the date/time by hand (survives mode re-analysis)

export interface UploadItem {
  /** Engine-local id (stable across sessions; storage key). */
  id: string
  /** Original filename (as sent to the API). */
  filename: string
  /** Relative path within the dropped folder (display only). */
  relativePath: string
  fileSizeBytes: number
  /** Target stream/site id. */
  streamId: string
  /** Owning project slug — partitions the queue for multi-project windows
   * (each pop-out drives only its own project's items). */
  projectSlug?: string
  state: UploadItemState
  /** ISO-8601 UTC recording timestamp (parsed from filename). */
  timestampUtc?: string
  // -- staged-analysis fields (populated by the analyze step) ---------------
  /** Directory part of relativePath ('' for root drops). */
  directory?: string
  /** Site display name (denormalized for the table). */
  siteName?: string
  /** Wall-clock recording time in the DETERMINED zone: `YYYY-MM-DDTHH:mm:ss`. */
  localWallTime?: string
  /** How the timezone was decided. */
  timezoneSource?: TimezoneSource
  /** Display string: IANA zone name or `+HH:MM` offset or `UTC`. */
  timezoneName?: string
  /** Container format from the header probe. */
  fileFormat?: 'wav' | 'flac' | 'opus' | 'aiff' | 'unknown'
  /** Analysis failure (no timestamp derivable, unreadable, …). Item stays
   * `staged` but is excluded from Start until resolved/cleared. */
  analysisError?: string
  /** Id of the user's saved filename format that parsed this name, when one
   * did. Absent when a built-in auto-detect pattern matched (the common case)
   * or nothing matched at all. */
  matchedFormatId?: string
  /** Label of that saved format, denormalized so the staging table can name it
   * without holding the user's format list. */
  matchedFormatLabel?: string
  /** Non-time metadata a saved pattern extracted from the filename
   * (%V device id, %K kHz, %L seconds). CAPTURE-ONLY (operator 2026-08-19):
   * recorded for display/telemetry, no behaviour keyed on it. */
  filenameMetadata?: { deviceId?: string, sampleRateKhz?: number, durationSecs?: number }
  /** Non-blocking advisory shown alongside the row (e.g. an unusually old
   * date that is probably a digitised archive but MIGHT be a recorder whose
   * clock reset). Unlike analysisError this never excludes the item from
   * Start — it exists so a genuine archive uploads freely while a flat-battery
   * recorder still gets noticed. */
  notice?: string
  /** Set when the FLAC transcode stage encoded this item (UI: transcode column). */
  transcoded?: boolean
  /** Pre-transcode identity, kept so a retry after the encoded blob was
   * released (terminal-state cache eviction) can re-enter through prepare
   * and re-encode instead of signing a FLAC name over WAV bytes. */
  originalFilename?: string
  originalFileSizeBytes?: number
  // -- transfer metrics ------------------------------------------------------
  /** Epoch ms when the first byte of the (current attempt's) PUT went out. */
  uploadStartedAtMs?: number
  /** Epoch ms when the PUT (or multipart complete) finished. */
  uploadEndedAtMs?: number
  /** sha1 hex of file content (computed during prepare). */
  checksumSha1?: string
  /** Duration in ms (parsed from audio header during prepare). */
  durationMs?: number
  sampleRateHz?: number
  /** Bits per sample (parsed from the audio header). */
  bitDepth?: number
  /** Server upload id (after signing). */
  uploadId?: string
  /** Signed PUT URL (after signing). expires ~24h server-side. */
  signedUrl?: string
  /** When the signed URL was issued (epoch ms) — used for expiry re-sign. */
  signedAtMs?: number
  /** Upload attempts so far. */
  attempts: number
  /** Multipart state (files above the multipart threshold). */
  multipart?: {
    multipartUploadId: string
    partSizeBytes: number
    partCount: number
    partUrls: Array<{ partNumber: number, url: string }>
    /** ETags of parts confirmed uploaded (persisted for resume). */
    completedParts: Array<{ partNumber: number, etag: string }>
  }
  /** True when a failure is safe to retry (network class, checksum). */
  retryable?: boolean
  /** Human-readable failure/rejection reason. */
  error?: string
  /** 0..1 PUT progress (transient; not persisted every tick). */
  progress?: number
  createdAtMs: number
  updatedAtMs: number
}

/** Aggregate queue statistics for UI. */
export interface QueueStats {
  total: number
  analyzing: number
  staged: number
  queued: number
  preparing: number
  ready: number
  signing: number
  signed: number
  uploading: number
  uploaded: number
  ingested: number
  duplicate: number
  failed: number
  rejected: number
  cancelled: number
  paused: number
  bytesTotal: number
  bytesUploaded: number
}

// ---------------------------------------------------------------------------
// Adapters (implemented per shell: browser now, desktop later)
// ---------------------------------------------------------------------------

/** Persistent queue storage (IndexedDB in browser, sqlite on desktop). */
export interface UploadStore {
  put: (item: UploadItem) => Promise<void>
  putMany: (items: UploadItem[]) => Promise<void>
  get: (id: string) => Promise<UploadItem | undefined>
  /** All items, optionally filtered by state. */
  list: (states?: UploadItemState[]) => Promise<UploadItem[]>
  delete: (id: string) => Promise<void>
  clearTerminal: () => Promise<void>
}

/** Provides file bytes for an item (browser File handle, desktop fs path). */
export interface FileSource {
  /** Returns a Blob/stream view of the file, or undefined if gone. */
  getFile: (itemId: string) => Promise<Blob | undefined>
}

/** Supplies a fresh Auth0 access token before each signing batch. */
export type TokenProvider = () => Promise<string>

// ---------------------------------------------------------------------------
// Ingest API DTOs (POST /uploads/bulk, POST /uploads/status)
// ---------------------------------------------------------------------------

export interface BulkSignRequestItem {
  filename: string
  timestamp: string
  stream: string
  duration?: number
  fileSize?: number
  sampleRate?: number
  checksum?: string
}

export interface BulkSignResponseItem {
  index: number
  ok: boolean
  uploadId?: string
  url?: string
  path?: string
  bucket?: string
  uploadTargetId?: string
  status?: number
  error?: string
}

export interface BulkSignResponse {
  requested: number
  created: number
  failed: number
  uploads: BulkSignResponseItem[]
}

export interface UploadStatusResponseItem {
  index: number
  ok: boolean
  uploadId?: string
  status?: number
  statusName?: string
  terminal?: boolean
  retryable?: boolean
  nextAction?:
    | 'wait'
    | 'complete'
    | 'ignore_duplicate'
    | 'retry_upload'
    | 'review_error'
    | 'contact_support'
  failureMessage?: string | null
  error?: string
}

export interface UploadStatusResponse {
  requested: number
  found: number
  failed: number
  uploads: UploadStatusResponseItem[]
}

// ---------------------------------------------------------------------------
// Engine configuration & events
// ---------------------------------------------------------------------------

export interface UploadEngineConfig {
  /** Ingest API base, e.g. https://ingest.rfcx.org (no trailing slash). */
  ingestBaseUrl: string
  /** Max concurrent PUTs. Default 4. */
  maxConcurrentUploads?: number
  /** Max concurrent prepare workers. Default 2. */
  maxConcurrentPrepares?: number
  /** Items per /uploads/bulk call (server cap 100). Default 100. */
  signBatchSize?: number
  /** Coalescing window before signing a PARTIAL batch while prepares are
   * still feeding (ms). Bigger batches = fewer round trips. Default 750. */
  signCoalesceMs?: number
  /** Items per /uploads/status call (server cap 100). Default 100. */
  statusBatchSize?: number
  /** Max upload attempts per item before terminal failure. Default 5. */
  maxAttempts?: number
  /** Base backoff delay ms (exponential + jitter). Default 2000. */
  retryBaseDelayMs?: number
  /** Cap on backoff delay ms. Default 60000. */
  retryMaxDelayMs?: number
  /** Status poll interval while items are in server processing. Default 5000. */
  statusPollIntervalMs?: number
  /** Re-sign URLs older than this (server expiry 24h). Default 20h. */
  signedUrlMaxAgeMs?: number
  /** Files >= this use the multipart path. Default 100MB (server minimum). */
  multipartThresholdBytes?: number
  /** Concurrent part PUTs within one multipart file. Default 3. */
  multipartPartConcurrency?: number
  /**
   * Learn the upload cap from the link instead of using a fixed one
   * (default true). The optimum concurrency is a property of the connection,
   * not a preference: a saturated field link is fastest and safest at ~1-2,
   * while a fast link with per-request dead time benefits up to ~8. See
   * adaptive-concurrency.ts for the measurements. Set false to pin the cap to
   * maxConcurrentUploads (useful for benchmarking).
   */
  adaptiveConcurrency?: boolean
  /**
   * How far prepare/sign may run AHEAD of the upload pool, as a multiple of
   * the current upload cap. Bounds the encoded-FLAC backlog held in memory;
   * without it, prepare drains the whole queue and the backlog scales with
   * batch size. Default 3.
   */
  prepareAheadFactor?: number
  /**
   * Floor on the prepare-ahead window, in ITEMS. Protects sign-batch
   * coalescing: on a slow link `cap * factor` would be 3-6 items, which turns
   * one bulk sign call into many serial round trips (the 2026-08-12 "Waiting
   * for URL" bottleneck). Default 24.
   */
  prepareAheadMin?: number
  /**
   * Ceiling on the prepare-ahead window, in BYTES. This is the bound that
   * actually protects memory, because item COUNT is the wrong unit when file
   * sizes span orders of magnitude. Default 512 MiB — measured in-browser as
   * roughly where Chrome stops holding blob data resident and starts spilling
   * to disk. One item is always allowed through, so a single larger-than-
   * budget file cannot deadlock the queue.
   */
  prepareAheadMaxBytes?: number
  /** Optional lane tier hint passed at signing. */
  laneTier?: 'express' | 'priority' | 'standard'
}

export type UploadEngineEvent =
  | { type: 'item-updated', item: UploadItem }
  | { type: 'stats', stats: QueueStats }
  | { type: 'engine-state', running: boolean, online: boolean }
  | { type: 'error', message: string, itemId?: string }

export type UploadEngineListener = (event: UploadEngineEvent) => void
