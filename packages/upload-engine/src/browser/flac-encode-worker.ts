/**
 * Web Worker entry for the FLAC encoder (#112 slice 4).
 *
 * Runs encodeWavToFlac off the main thread. The page-side wrapper
 * (flac-encode-client.ts) posts { id, file, meta } and receives progress +
 * result/error messages. One encode at a time per worker (the transcode
 * stage serializes; parallel encodes would fight for cores with the sha1
 * hashing of other files anyway).
 *
 * This file is a MODULE worker (vite `new Worker(url, { type: 'module' })`)
 * so the libflacjs import graph loads exactly as in tests.
 */
import { encodeWavToFlac } from '../flac-encoder'
import { type WavMetadata } from '../wav-metadata'

export interface EncodeRequest {
  kind: 'encode'
  id: string
  file: Blob
  meta: WavMetadata
}

export type EncodeResponse =
  | { kind: 'progress', id: string, bytesIn: number, totalBytesIn: number }
  | { kind: 'done', id: string, flacBytes: ArrayBuffer, bytesIn: number, settings: { compression: number, verify: boolean, library: string } }
  | { kind: 'error', id: string, message: string }

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<EncodeRequest>) => void) | null
  postMessage: (message: EncodeResponse, transfer?: Transferable[]) => void
}

scope.onmessage = (event: MessageEvent<EncodeRequest>): void => {
  const { kind, id, file, meta } = event.data
  if (kind !== 'encode') return
  void (async () => {
    try {
      const result = await encodeWavToFlac(file, meta, (p) => {
        scope.postMessage({ kind: 'progress', id, bytesIn: p.bytesIn, totalBytesIn: p.totalBytesIn })
      })
      // transfer the buffer (zero-copy) rather than clone ~350MB
      const buffer = result.flacBytes.buffer.slice(
        result.flacBytes.byteOffset,
        result.flacBytes.byteOffset + result.flacBytes.byteLength
      )
      scope.postMessage(
        { kind: 'done', id, flacBytes: buffer, bytesIn: result.bytesIn, settings: result.settings },
        [buffer]
      )
    } catch (err) {
      scope.postMessage({ kind: 'error', id, message: err instanceof Error ? err.message : String(err) })
    }
  })()
}
