/**
 * Multipart upload support (large-file path).
 *
 * Files >= the server's multipart threshold are uploaded in server-sized
 * parts, each an independent presigned PUT with its own retry budget — a
 * dropped connection retries only the in-flight part, never the whole file.
 * Completed part ETags persist on the item, so a resumed session re-uploads
 * only missing parts (within the same multipart upload).
 *
 * Server contract (ingest-service):
 *   POST /uploads/multipart                → { uploadId, multipartUploadId,
 *                                             partSizeBytes, partCount,
 *                                             partUrls: [{partNumber, url}] }
 *   POST /uploads/:id/multipart/complete   → { completed: true }
 *   POST /uploads/:id/multipart/abort      → { aborted: true }
 */

import { type PutProgressEvent, IngestApiError } from './ingest-api'
import { type TokenProvider } from './types'

/** Client-side default threshold; the server enforces its own minimum too. */
export const MULTIPART_THRESHOLD_BYTES = 100 * 1024 * 1024

export interface MultipartDescriptor {
  uploadId: string
  multipartUploadId: string
  partSizeBytes: number
  partCount: number
  partUrls: Array<{ partNumber: number, url: string }>
  bucket?: string
  uploadTargetId?: string
}

export interface CompletedPart {
  partNumber: number
  etag: string
}

const postJson = async <T>(url: string, token: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const data = await response.json() as { message?: string }
      if (data.message !== undefined) message = data.message
    } catch {}
    throw new IngestApiError(message, response.status)
  }
  return await response.json() as T
}

export class MultipartApi {
  constructor (
    private readonly baseUrl: string,
    private readonly getToken: TokenProvider
  ) {}

  async create (item: {
    filename: string
    timestamp: string
    stream: string
    duration?: number
    fileSize: number
    sampleRate?: number
    checksum?: string
  }): Promise<MultipartDescriptor> {
    const token = await this.getToken()
    return await postJson<MultipartDescriptor>(`${this.baseUrl}/uploads/multipart`, token, item)
  }

  async complete (uploadId: string, parts: CompletedPart[]): Promise<void> {
    const token = await this.getToken()
    await postJson(`${this.baseUrl}/uploads/${uploadId}/multipart/complete`, token, { parts })
  }

  async abort (uploadId: string): Promise<void> {
    const token = await this.getToken()
    await postJson(`${this.baseUrl}/uploads/${uploadId}/multipart/abort`, token, {})
  }
}

/**
 * PUT one part (a Blob slice) to its presigned URL, returning the ETag.
 * The ETag response header is exposed by the R2 bucket CORS policy.
 */
export const putPart = async (
  url: string,
  partBlob: Blob,
  onProgress?: (event: PutProgressEvent) => void,
  abortSignal?: AbortSignal
): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress !== undefined) {
        onProgress({ loadedBytes: event.loaded, totalBytes: event.total })
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader('ETag') ?? xhr.getResponseHeader('etag')
        if (etag === null || etag === '') {
          reject(new IngestApiError('Part PUT succeeded but no ETag was exposed (check bucket CORS ExposeHeaders).', xhr.status))
        } else {
          resolve(etag)
        }
      } else {
        reject(new IngestApiError(`Part PUT failed: HTTP ${xhr.status}`, xhr.status))
      }
    }
    xhr.onerror = () => { reject(new IngestApiError('Part PUT network error', 0)) }
    xhr.onabort = () => { reject(new IngestApiError('Part PUT aborted', 0)) }
    if (abortSignal !== undefined) {
      abortSignal.addEventListener('abort', () => { xhr.abort() }, { once: true })
    }
    xhr.send(partBlob)
  })
}

export interface MultipartUploadOptions {
  /** Concurrent part PUTs within one file. Default 3. */
  partConcurrency?: number
  /** Max attempts per part. Default 5. */
  maxAttemptsPerPart?: number
  /** Base backoff ms (exponential + jitter). Default 2000. */
  retryBaseDelayMs?: number
  retryMaxDelayMs?: number
  onProgress?: (loadedBytes: number, totalBytes: number) => void
  abortSignal?: AbortSignal
  /** Parts already completed in a previous session (resume). */
  completedParts?: CompletedPart[]
}

/**
 * Upload all parts of a file against a MultipartDescriptor.
 * Returns the full ordered CompletedPart list ready for /complete.
 * Byte-level progress is aggregated across in-flight parts.
 */
export const uploadParts = async (
  file: Blob,
  descriptor: MultipartDescriptor,
  options: MultipartUploadOptions = {}
): Promise<CompletedPart[]> => {
  const partConcurrency = options.partConcurrency ?? 3
  const maxAttempts = options.maxAttemptsPerPart ?? 5
  const baseDelay = options.retryBaseDelayMs ?? 2000
  const maxDelay = options.retryMaxDelayMs ?? 60_000

  const completed = new Map<number, CompletedPart>()
  for (const part of options.completedParts ?? []) completed.set(part.partNumber, part)

  const pending = descriptor.partUrls.filter(part => !completed.has(part.partNumber))
  const partLoaded = new Map<number, number>()
  let completedBytes = 0
  for (const part of completed.values()) {
    completedBytes += partByteLength(file, descriptor, part.partNumber)
  }

  const reportProgress = (): void => {
    if (options.onProgress === undefined) return
    let inFlight = 0
    for (const loaded of partLoaded.values()) inFlight += loaded
    options.onProgress(completedBytes + inFlight, file.size)
  }

  const sleep = async (ms: number): Promise<void> => { await new Promise(resolve => setTimeout(resolve, ms)) }

  const uploadOne = async (part: { partNumber: number, url: string }): Promise<void> => {
    const start = (part.partNumber - 1) * descriptor.partSizeBytes
    const end = Math.min(start + descriptor.partSizeBytes, file.size)
    const blob = file.slice(start, end)
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (options.abortSignal?.aborted === true) throw new IngestApiError('Aborted', 0)
      try {
        const etag = await putPart(part.url, blob, (event) => {
          partLoaded.set(part.partNumber, event.loadedBytes)
          reportProgress()
        }, options.abortSignal)
        completed.set(part.partNumber, { partNumber: part.partNumber, etag })
        partLoaded.delete(part.partNumber)
        completedBytes += blob.size
        reportProgress()
        return
      } catch (err) {
        partLoaded.delete(part.partNumber)
        reportProgress()
        // Re-read aborted: it can flip asynchronously during the await above
        // (TS narrows it from the loop-top check otherwise).
        const signal: AbortSignal | undefined = options.abortSignal
        if (signal?.aborted === true || attempt >= maxAttempts) throw err
        const delay = Math.min(maxDelay, baseDelay * 2 ** (attempt - 1)) * (0.5 + Math.random())
        await sleep(delay)
      }
    }
  }

  // Bounded worker pool over the pending parts.
  const queue = [...pending]
  const workers = Array.from({ length: Math.min(partConcurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const part = queue.shift()
      if (part === undefined) return
      await uploadOne(part)
    }
  })
  await Promise.all(workers)

  return Array.from(completed.values()).sort((a, b) => a.partNumber - b.partNumber)
}

const partByteLength = (file: Blob, descriptor: MultipartDescriptor, partNumber: number): number => {
  const start = (partNumber - 1) * descriptor.partSizeBytes
  return Math.max(0, Math.min(start + descriptor.partSizeBytes, file.size) - start)
}
