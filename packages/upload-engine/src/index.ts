import { type UploadItem } from './types'

export * from './audio-metadata'
export * from './browser/browser-file-source'
export * from './browser/browser-prepare'
export * from './browser/flac-encode-client'
export * from './browser/flac-transcode'
export * from './browser/indexed-db-store'
export * from './engine'
export * from './flac-encoder'
export * from './ingest-api'
export * from './multipart'
export * from './sha1'
export * from './timestamp-parser'
export * from './types'
export * from './wav-metadata'

/** Create a fresh queue item from a picked/dropped file. */
export const createUploadItem = (params: {
  filename: string
  relativePath: string
  fileSizeBytes: number
  streamId: string
}): UploadItem => ({
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  filename: params.filename,
  relativePath: params.relativePath,
  fileSizeBytes: params.fileSizeBytes,
  streamId: params.streamId,
  state: 'queued',
  attempts: 0,
  createdAtMs: Date.now(),
  updatedAtMs: Date.now()
})
