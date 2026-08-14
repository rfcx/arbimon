/**
 * Client-side WAV->FLAC transcode stage (#112, slice 3).
 *
 * Wraps the browser prepare step: when a queued file is a losslessly-
 * encodable WAV (metadata-gated) and encoding is enabled, encode it to FLAC
 * BEFORE hashing — the sha1 the server sees is the sha1 of the bytes it
 * receives (the checksum contract). The encoded Blob is held in a cache the
 * TranscodingFileSource serves from, so the signing/upload path transparently
 * uploads the FLAC.
 *
 * FAIL OPEN AT EVERY STEP: parser says not-encodable -> original bytes;
 * encoder throws -> original bytes; anything unexpected -> original bytes.
 * A user's upload must never be blocked by the encoder existing.
 */

import { type PrepareFn, type PrepareResult } from '../engine'
import { encodeWavToFlac } from '../flac-encoder'
import { buildProvenanceComments, writeFlacComments } from '../flac-vorbis-comment'
import { type FileSource, type UploadItem } from '../types'
import { extractEmbeddedTimestamp } from '../wav-embedded-timestamp'
import { parseWavMetadata } from '../wav-metadata'
import { type EncodeFn } from './flac-encode-client'

/**
 * Module-scope latch so a broken encoder warns ONCE per session rather than
 * once per file. A 1,586-file batch must not emit 1,586 identical warnings.
 */
let encoderFailureReported = false

/** Reset the once-per-session warning latch (tests). */
export const resetEncoderFailureReporting = (): void => {
  encoderFailureReported = false
}

const reportEncoderFailure = (detail: string, options: FlacTranscodeOptions): void => {
  if (encoderFailureReported) return
  encoderFailureReported = true
  const message =
    '[upload-engine] FLAC encoding is unavailable — recordings will upload ' +
    `UNCOMPRESSED (about twice the bytes). First error: ${detail}`
  try {
    console.warn(message)
  } catch { /* console may be absent in exotic hosts */ }
  try {
    options.onEncoderUnavailable?.(detail)
  } catch { /* a telemetry hook must never break an upload */ }
}

export interface FlacTranscodeOptions {
  /** master switch (UI toggle). Default true. */
  enabled?: boolean
  /** only encode WAVs at least this large. Default 8 MiB (small files gain little). */
  minSizeBytes?: number
  /**
   * Encoder implementation. Default: in-thread encodeWavToFlac (tests, small
   * files). Shells SHOULD pass makeWorkerEncoder(...) so multi-hundred-MB
   * encodes never block the main thread.
   */
  encode?: EncodeFn
  /** telemetry/debug hook */
  onDecision?: (item: UploadItem, decision: 'encoded' | 'skipped' | 'failed-open', detail: string) => void
  /**
   * Called ONCE per session the first time the encoder fails, so a shell can
   * surface it to the user or send telemetry. Exists because a wholly broken
   * encoder is indistinguishable from "the feature is off" (§118) — this is
   * the signal that would have caught that in hours instead of days.
   */
  onEncoderUnavailable?: (detail: string) => void
}

/**
 * Cache of encoded FLAC blobs, keyed by item id. Entries are dropped when the
 * caller signals an item reached a terminal state (release()) so a long batch
 * does not accumulate every encoded file in memory.
 */
export class TranscodeCache {
  private readonly blobs = new Map<string, Blob>()

  set (id: string, blob: Blob): void { this.blobs.set(id, blob) }
  get (id: string): Blob | undefined { return this.blobs.get(id) }
  release (id: string): void { this.blobs.delete(id) }
  size (): number { return this.blobs.size }
}

/**
 * FileSource decorator: serves the encoded FLAC when one exists for the item,
 * otherwise falls through to the inner source (the original file).
 */
export class TranscodingFileSource<T extends FileSource = FileSource> implements FileSource {
  constructor (
    public readonly inner: T,
    private readonly cache: TranscodeCache
  ) {}

  async getFile (itemId: string): Promise<Blob | undefined> {
    return this.cache.get(itemId) ?? await this.inner.getFile(itemId)
  }

  /** Pass-through so shells can keep calling source.register(id, file). */
  register (itemId: string, file: File): void {
    (this.inner as unknown as { register?: (id: string, f: File) => void }).register?.(itemId, file)
  }
}

const isWavFilename = (filename: string): boolean =>
  filename.toLowerCase().endsWith('.wav')

const flacFilename = (filename: string): string =>
  filename.replace(/\.wav$/i, '.flac')

/**
 * Wrap a PrepareFn with the transcode stage.
 *
 * Ordering: transcode FIRST, then delegate to the inner prepare with the
 * (possibly) encoded file — so the inner step's sha1 and duration probe see
 * the bytes that will actually be uploaded.
 */
export const withFlacTranscode = (
  inner: PrepareFn,
  cache: TranscodeCache,
  options: FlacTranscodeOptions = {}
): PrepareFn => {
  const enabled = options.enabled ?? true
  const minSize = options.minSizeBytes ?? 8 * 1024 * 1024

  return async (item: UploadItem, file: Blob): Promise<PrepareResult> => {
    if (!enabled || !isWavFilename(item.filename) || file.size < minSize) {
      if (enabled && isWavFilename(item.filename)) {
        options.onDecision?.(item, 'skipped', `below minSize (${file.size} < ${minSize})`)
      }
      return await inner(item, file)
    }

    try {
      const meta = await parseWavMetadata(file)
      if (!meta.flacEncodable) {
        // fail open: not guaranteed lossless -> upload the original untouched
        options.onDecision?.(item, 'failed-open', meta.reasons.join('; '))
        return await inner(item, file)
      }

      const result = await (options.encode ?? encodeWavToFlac)(file, meta)

      // PRESERVE RECORDER PROVENANCE (2026-08-13). The encoder emits no tags,
      // so a transcoded WAV would reach the server stripped of its GUANO /
      // AudioMoth metadata — device id, deployment, gain, battery,
      // temperature. The server persists those (stream_source_files.meta) and
      // production is full of them, so dropping them is permanent, silent loss
      // of field provenance that the desktop uploader did NOT have (it
      // re-attached metadata via ffmpeg -metadata). Carry them into the FLAC's
      // Vorbis comment block instead.
      //
      // FAIL OPEN, like every other step here: if the source has no metadata,
      // or the write fails, we keep the encoder's bytes unchanged.
      let flacBytes = result.flacBytes
      try {
        const embedded = await extractEmbeddedTimestamp(file)
        const comments = buildProvenanceComments({
          rawMetadata: embedded?.rawMetadata,
          originalFilename: item.filename
        })
        if (comments.length > 0) {
          flacBytes = writeFlacComments(flacBytes, comments)
        }
      } catch { /* provenance is best-effort; never block the upload */ }

      const flacBlob = new Blob([flacBytes as BlobPart], { type: 'audio/flac' })

      // sanity: an "encode" that GREW the file is suspicious enough to skip
      // (pathological already-compressed content) — original wins.
      if (flacBlob.size >= file.size) {
        options.onDecision?.(item, 'failed-open', `encoded larger than source (${flacBlob.size} >= ${file.size})`)
        return await inner(item, file)
      }

      cache.set(item.id, flacBlob)
      options.onDecision?.(item, 'encoded',
        `${file.size} -> ${flacBlob.size} bytes (${Math.round(100 * flacBlob.size / file.size)}%)`)

      // inner prepare runs on the ENCODED bytes: sha1-after-encode + probes
      const prepared = await inner(item, flacBlob)
      if (prepared.error !== undefined) {
        // inner rejected the encoded file (should not happen) — fail open
        cache.release(item.id)
        options.onDecision?.(item, 'failed-open', `inner prepare rejected encoded file: ${prepared.error}`)
        return await inner(item, file)
      }
      return {
        ...prepared,
        transcodedFilename: flacFilename(item.filename),
        transcodedSizeBytes: flacBlob.size
      }
    } catch (err) {
      // ANY encoder failure: fail open to the original file.
      const detail = err instanceof Error ? err.message : String(err)
      cache.release(item.id)
      options.onDecision?.(item, 'failed-open', detail)
      // ⚠️ BUT MAKE A SYSTEMIC FAILURE LOUD (OPEN-ITEMS §118).
      //
      // Failing open is right for ONE bad file. It is catastrophic as a global
      // posture: when the encoder could not load at all (a rollup UMD stub
      // that threw on every encode), this handler silently downgraded EVERY
      // upload to an un-transcoded WAV — roughly 2× the bytes — for two days,
      // and a green "served-bundle-verified" check missed it because the chunk
      // fetched 200 while no encode ever succeeded.
      //
      // So: report the FIRST failure once, loudly, and tell the caller via
      // onEncoderUnavailable so a shell can surface/telemeter it. Per-file
      // failures stay quiet after that — we want a signal, not a flood.
      reportEncoderFailure(detail, options)
      return await inner(item, file)
    }
  }
}
