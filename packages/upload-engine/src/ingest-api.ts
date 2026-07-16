/**
 * Thin typed client for the ingest-service bulk endpoints.
 * fetch-based, no axios dependency — usable in browser, worker, and Node 18+.
 */

import { type BulkSignRequestItem, type BulkSignResponse, type TokenProvider, type UploadStatusResponse } from './types'

export class IngestApiError extends Error {
  constructor (message: string, public readonly status: number) {
    super(message)
    this.name = 'IngestApiError'
  }
}

const postJson = async <T>(
  url: string,
  token: string,
  body: unknown
): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const data = (await response.json()) as { message?: string }
      if (data.message !== undefined) message = data.message
    } catch {}
    throw new IngestApiError(message, response.status)
  }
  return (await response.json()) as T
}

export class IngestApi {
  constructor (
    private readonly baseUrl: string,
    private readonly getToken: TokenProvider
  ) {}

  /** POST /uploads/bulk — one signed PUT URL per item (server cap 100/req). */
  async signBulk (
    items: BulkSignRequestItem[],
    laneTier?: string
  ): Promise<BulkSignResponse> {
    const token = await this.getToken()
    const uploads =
      laneTier === undefined
        ? items
        : items.map(item => ({ ...item, laneTier }))
    return await postJson<BulkSignResponse>(
      `${this.baseUrl}/uploads/bulk`,
      token,
      { uploads }
    )
  }

  /** POST /uploads/status — ingest status for up to 100 upload ids. */
  async getStatuses (uploadIds: string[]): Promise<UploadStatusResponse> {
    const token = await this.getToken()
    return await postJson<UploadStatusResponse>(
      `${this.baseUrl}/uploads/status`,
      token,
      { uploadIds }
    )
  }
}

export interface PutProgressEvent {
  loadedBytes: number
  totalBytes: number
}

/**
 * PUT a Blob to a presigned URL with progress callbacks.
 * XHR (not fetch) so we get upload.onprogress in every browser.
 * The only header sent is Content-Type — it must match what the URL was
 * signed with and is covered by the R2 bucket CORS policy.
 */
export const putToSignedUrl = async (
  signedUrl: string,
  blob: Blob,
  contentType: string,
  onProgress?: (event: PutProgressEvent) => void,
  abortSignal?: AbortSignal
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress !== undefined) {
        onProgress({ loadedBytes: event.loaded, totalBytes: event.total })
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else {
        reject(
          new IngestApiError(
            `Upload PUT failed: HTTP ${xhr.status}`,
            xhr.status
          )
        )
      }
    }
    xhr.onerror = () => {
      reject(new IngestApiError('Upload PUT network error', 0))
    }
    xhr.onabort = () => {
      reject(new IngestApiError('Upload PUT aborted', 0))
    }
    if (abortSignal !== undefined) {
      abortSignal.addEventListener(
        'abort',
        () => {
          xhr.abort()
        },
        { once: true }
      )
    }
    xhr.send(blob)
  })
}
