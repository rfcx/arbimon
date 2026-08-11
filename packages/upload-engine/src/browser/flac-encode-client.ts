/**
 * Page-side client for the FLAC encode worker (#112 slice 4).
 *
 * Same signature as encodeWavToFlac, so withFlacTranscode accepts either:
 * pass makeWorkerEncoder(() => new Worker(...)) as options.encode to move
 * encoding off the main thread. The worker is created lazily on first use
 * and reused; a worker error fails the CURRENT encode (the transcode stage
 * fails open to the original file) and discards the worker so the next
 * encode gets a fresh one.
 */
import { type FlacEncodeProgress, type FlacEncodeResult } from '../flac-encoder'
import { type WavMetadata } from '../wav-metadata'
import { type EncodeResponse } from './flac-encode-worker'

export type EncodeFn = (
  blob: Blob,
  meta: WavMetadata,
  onProgress?: (p: FlacEncodeProgress) => void
) => Promise<FlacEncodeResult>

export const makeWorkerEncoder = (createWorker: () => Worker): EncodeFn => {
  let worker: Worker | undefined
  let nextId = 0
  // one in-flight encode at a time (the transcode stage serializes anyway)
  let busy: Promise<unknown> = Promise.resolve()

  const run: EncodeFn = async (blob, meta, onProgress) => {
    worker ??= createWorker()
    const w = worker
    const id = `enc-${++nextId}`

    return await new Promise<FlacEncodeResult>((resolve, reject) => {
      const cleanup = (): void => {
        w.removeEventListener('message', onMessage)
        w.removeEventListener('error', onError)
      }
      const onMessage = (event: MessageEvent<EncodeResponse>): void => {
        const msg = event.data
        if (msg.id !== id) return
        if (msg.kind === 'progress') {
          onProgress?.({ bytesIn: msg.bytesIn, bytesOut: 0, totalBytesIn: msg.totalBytesIn })
        } else if (msg.kind === 'done') {
          cleanup()
          resolve({ flacBytes: new Uint8Array(msg.flacBytes), bytesIn: msg.bytesIn, settings: msg.settings })
        } else if (msg.kind === 'error') {
          cleanup()
          reject(new Error(msg.message))
        }
      }
      const onError = (event: ErrorEvent): void => {
        cleanup()
        worker = undefined // fresh worker next time
        reject(new Error(`encode worker crashed: ${event.message}`))
      }
      w.addEventListener('message', onMessage)
      w.addEventListener('error', onError)
      w.postMessage({ kind: 'encode', id, file: blob, meta })
    })
  }

  // serialize
  return async (blob, meta, onProgress) => {
    const task = busy.then(async () => await run(blob, meta, onProgress))
    busy = task.catch(() => undefined)
    return await task
  }
}
