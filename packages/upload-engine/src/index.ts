import { type UploadItem } from './types'

export * from './adaptive-concurrency'
export * from './analyze'
export * from './audio-metadata'
export * from './browser/browser-file-source'
export * from './browser/browser-prepare'
export * from './browser/flac-encode-client'
export * from './browser/flac-transcode'
export * from './browser/indexed-db-store'
export * from './engine'
export * from './flac-encoder'
export * from './flac-vorbis-comment'
export * from './ingest-api'
export * from './multipart'
export * from './recorder-provenance'
export * from './sha1'
export * from './timestamp-parser'
export * from './types'
export * from './utc-offset'
export * from './wav-embedded-timestamp'
export * from './wav-metadata'

/** Create a fresh queue item from a picked/dropped file. */
export const createUploadItem = (params: {
  filename: string
  relativePath: string
  fileSizeBytes: number
  streamId: string
  /** Owning project (multi-window queue partitioning). */
  projectSlug?: string
  /** 'queued' = legacy direct-enqueue; 'analyzing' = staged intake. */
  initialState?: 'queued' | 'analyzing'
}): UploadItem => ({
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  filename: params.filename,
  relativePath: params.relativePath,
  directory: params.relativePath.includes('/')
    ? params.relativePath.slice(0, params.relativePath.lastIndexOf('/'))
    : '',
  fileSizeBytes: params.fileSizeBytes,
  streamId: params.streamId,
  projectSlug: params.projectSlug,
  state: params.initialState ?? 'queued',
  attempts: 0,
  createdAtMs: Date.now(),
  updatedAtMs: Date.now()
})
