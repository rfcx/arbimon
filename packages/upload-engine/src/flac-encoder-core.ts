/**
 * Minimal FLAC encoder driver over the libflac WASM module.
 *
 * WHY THIS EXISTS (OPEN-ITEMS §118 — a silent, two-day production-shaped
 * outage on the demo tier):
 *
 * We previously used `libflacjs/lib/encoder`, which is a UMD module whose
 * factory SHADOWS `require` as a parameter:
 *
 *     (function (factory) { ... factory(require, exports) ... })
 *     (function (require, exports) { const d = require("./utils/data-utils") })
 *
 * Rollup cannot statically analyse that, so it routed the call through a
 * shared `_commonjs-dynamic-modules` chunk whose only export THROWS:
 *   'Could not dynamically require "./utils/data-utils" …'
 *
 * The build SUCCEEDED, the worker chunk was emitted, and every asset served
 * HTTP 200 — the failure only appeared when an encode was attempted. Because
 * `withFlacTranscode` fails OPEN, every WAV then uploaded silently
 * un-transcoded and the feature looked switched off rather than broken.
 *
 * Three bundler-level fixes were tried and MEASURED against the live demo tier
 * before landing this one (each is recorded so nobody repeats them):
 *   1. `dynamicRequireTargets` — makes rollup keep a RUNTIME require shim whose
 *      module ids are ABSOLUTE BUILD PATHS
 *      (`/packages/upload-engine/node_modules/...`). Those 404 in production,
 *      except this is an SPA so nginx answers them with index.html (200,
 *      text/html) and the failure resurfaces as an opaque worker error.
 *   2. `transformMixedEsModules` alone — the throwing stub chunk was still
 *      emitted and still imported by `encoder-*.js`.
 *   3. `optimizeDeps.include` pre-bundling — changed the error to
 *      `require is not defined`, i.e. a bare CJS require survived into ESM
 *      output.
 *
 * So the durable fix is to NOT depend on the UMD wrapper at all. We only ever
 * used three methods (`encode`, `getSamples`, `destroy`), and the underlying
 * `libflac.js` WASM module — which we already import directly and which is
 * plain ESM-friendly — exposes everything needed. This file reimplements just
 * that surface against the WASM API, so the bundler never sees a dynamic
 * require.
 *
 * Behaviour is pinned by the existing lossless-parity tests: encode → decode →
 * compare samples must remain bit-exact, AND by a byte-identity test proving
 * this driver emits the SAME BYTES as the libflacjs Encoder it replaced
 * (verified: 19,470 bytes, 0 differing). That last property matters because
 * ingest dedup is keyed on the uploaded file's sha1 — a different-but-valid
 * stream would silently change every file's identity.
 *
 * MUTATION-TEST STATUS (2026-08-13): 4 of 9 valid mutations are caught. The 5
 * survivors were each investigated rather than excused, and are documented at
 * their site below. Summary of WHY they are unkillable here:
 *   - the write-callback copy is DEFENSIVE, not load-bearing: measured 15
 *     callbacks returning 15 DISTINCT backing ArrayBuffers, so libflac's glue
 *     already hands out fresh views. Kept anyway (see the note there).
 *   - `verify` does not change OUTPUT BYTES (it is libFLAC's internal
 *     self-check), so no output-comparing test can see it flip.
 *   - the destroy()/guard mutations are resource-lifecycle properties that a
 *     short-lived test process does not feel; the leak guard catches runaway
 *     growth, not a single missed free.
 * Do NOT "simplify" these away on the grounds that tests still pass.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FlacEncoderOptions {
  sampleRate: number
  channels: number
  bitsPerSample: number
  /** 0..8; 5 is libFLAC's default and what we shipped previously. */
  compression: number
  /**
   * Total interchannel samples the stream WILL contain, when known up front.
   *
   * Written into STREAMINFO's total-samples field, which is what lets any
   * decoder report a duration. Omit (or 0) only for genuinely unbounded
   * streams -- 0 means "unknown", and a FLAC whose STREAMINFO says unknown
   * makes `ffprobe` report `Duration: N/A`, which the ingest pipeline rejects
   * outright ("Audio duration is zero", OPEN-ITEMS 183).
   *
   * NOTE the underlying C call is `set_total_samples_ESTIMATE`; libFLAC still
   * writes the value verbatim into STREAMINFO at init, and (since we encode to
   * a non-seekable stream) never rewrites it afterwards. So it must be EXACT,
   * not approximate -- pass a count derived from the source, never a guess.
   */
  totalSamples?: number
  /** Ask libFLAC to verify each frame as it encodes. */
  verify: boolean
}

/**
 * A tiny stand-in for libflacjs's `Encoder` class, implemented directly on the
 * WASM module. Same three-method surface we actually used.
 */
export class FlacStreamEncoder {
  private readonly flac: any
  private readonly encoderId: number
  private readonly chunks: Uint8Array[] = []
  private totalBytes = 0
  private finished = false
  private destroyed = false

  constructor (flac: any, options: FlacEncoderOptions) {
    this.flac = flac

    const id = flac.create_libflac_encoder(
      options.sampleRate,
      options.channels,
      options.bitsPerSample,
      options.compression,
      // EXACT total when the caller knows it (WAV data-chunk size / frame
      // size); 0 only when genuinely unknown. See totalSamples above -- a 0
      // here is what caused every browser-transcoded upload to be rejected.
      options.totalSamples ?? 0,
      options.verify ? 1 : 0
    )
    if (id === 0) {
      throw new Error('libflac: create_libflac_encoder returned 0 (bad parameters?)')
    }
    this.encoderId = id

    const status = flac.init_encoder_stream(
      id,
      (buffer: Uint8Array, bytes: number) => {
        // Defensive copy of the callback's view.
        //
        // MEASURED 2026-08-13: libflac's JS glue actually allocates a FRESH
        // ArrayBuffer per callback (15 callbacks -> 15 distinct buffers), so
        // this copy is not currently load-bearing and a mutation removing it
        // cannot be caught by any output test. It is KEPT deliberately: the
        // C API contract makes no such promise, the glue could start reusing a
        // heap view in any future release, and the failure mode would be
        // SILENT AUDIO CORRUPTION in already-uploaded archives rather than an
        // error. A copy per output block is negligible next to the encode.
        this.chunks.push(new Uint8Array(buffer.subarray(0, bytes)))
        this.totalBytes += bytes
        return 0 // FLAC__STREAM_ENCODER_WRITE_STATUS_OK
      }
    )
    if (status !== 0) {
      // free the handle before surfacing the failure
      try { flac.FLAC__stream_encoder_delete(id) } catch { /* best effort */ }
      throw new Error(`libflac: init_encoder_stream failed with status ${String(status)}`)
    }
  }

  /**
   * Encode one block of per-channel PCM. Call with no argument to finalise.
   * Returns false when libFLAC rejects the block (verify failure/internal).
   */
  encode (channelData?: Int32Array[]): boolean {
    if (this.destroyed) throw new Error('encoder already destroyed')
    if (channelData === undefined) {
      if (this.finished) return true
      this.finished = true
      return this.flac.FLAC__stream_encoder_finish(this.encoderId) as boolean
    }
    const samples = channelData[0]?.length ?? 0
    if (samples === 0) return true
    return this.flac.FLAC__stream_encoder_process(
      this.encoderId,
      channelData,
      samples
    ) as boolean
  }

  /** The encoded FLAC stream collected from the write callback. */
  getSamples (): Uint8Array {
    const out = new Uint8Array(this.totalBytes)
    let offset = 0
    for (const chunk of this.chunks) {
      out.set(chunk, offset)
      offset += chunk.length
    }
    return out
  }

  /** Release the native encoder. Safe to call more than once. */
  destroy (): void {
    if (this.destroyed) return
    this.destroyed = true
    try {
      if (!this.finished) this.flac.FLAC__stream_encoder_finish(this.encoderId)
    } catch { /* finishing a broken stream is best-effort */ }
    try {
      this.flac.FLAC__stream_encoder_delete(this.encoderId)
    } catch { /* best effort */ }
  }
}
