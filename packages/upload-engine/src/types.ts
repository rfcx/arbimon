/**
 * Core types for the bulk upload engine.
 *
 * The engine is framework-free and shell-agnostic: the browser app and the
 * (future) desktop shell provide adapters (Store, FileSource, TokenProvider)
 * while the engine owns the pipeline: prepare → sign → upload → track.
 */

/** Lifecycle state of a single file in the local queue. */
export type UploadItemState =
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
  state: UploadItemState
  /** ISO-8601 UTC recording timestamp (parsed from filename). */
  timestampUtc?: string
  /** sha1 hex of file content (computed during prepare). */
  checksumSha1?: string
  /** Duration in ms (parsed from audio header during prepare). */
  durationMs?: number
  sampleRateHz?: number
  /** Server upload id (after signing). */
  uploadId?: string
  /** Signed PUT URL (after signing). expires ~24h server-side. */
  signedUrl?: string
  /** When the signed URL was issued (epoch ms) — used for expiry re-sign. */
  signedAtMs?: number
  /** Upload attempts so far. */
  attempts: number
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
  /** Optional lane tier hint passed at signing. */
  laneTier?: 'express' | 'priority' | 'standard'
}

export type UploadEngineEvent =
  | { type: 'item-updated', item: UploadItem }
  | { type: 'stats', stats: QueueStats }
  | { type: 'engine-state', running: boolean, online: boolean }
  | { type: 'error', message: string, itemId?: string }

export type UploadEngineListener = (event: UploadEngineEvent) => void
