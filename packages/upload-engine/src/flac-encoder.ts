/**
 * WAV -> FLAC lossless encoder core (client-side FLAC encoding, slice 2).
 *
 * Pure encode logic, deliberately Worker-free: this module is driven either
 * directly (tests, Node) or from the Web Worker wrapper (browser). Keeping
 * the core synchronous-per-chunk and transport-agnostic is what makes the
 * lossless-parity test (encode -> decode -> compare PCM) runnable in vitest
 * without a browser.
 *
 * Contract (OPEN-ITEMS #112):
 *  - input must have passed parseWavMetadata().flacEncodable — this module
 *    THROWS on anything else rather than guessing (the caller's fail-open
 *    handles it by uploading the original file);
 *  - encoding is chunked: we never hold the whole decoded WAV and the whole
 *    FLAC in memory at once (2h/700MB files are the use case);
 *  - settings are pinned: compression level 5, verify=true (libflac's own
 *    decode-verify while encoding — a corrupted encode fails loudly instead
 *    of producing a bad file).
 */

/// <reference path="./libflacjs.d.ts" />
// ^ the shim must travel with this file: consumers (apps/website vue-tsc)
// compile upload-engine SOURCE through workspace paths and do not inherit
// this package's tsconfig "paths" — without the reference their builds fail
// resolving the libflacjs deep imports (upstream's declarations are broken).
import { FlacStreamEncoder } from './flac-encoder-core'
import type { WavMetadata } from './wav-metadata'

// libflacjs ships an Emscripten bundle; typed loosely on purpose — the
// surface we use is small and pinned by tests.
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FlacEncodeProgress {
  bytesIn: number
  bytesOut: number
  totalBytesIn: number
}

export interface FlacEncodeResult {
  flacBytes: Uint8Array
  /** input PCM bytes consumed (== meta.dataByteLength) */
  bytesIn: number
  /** pinned encoder settings, recorded for provenance/telemetry */
  settings: { compression: number, verify: boolean, library: string }
}

/** Bytes of PCM fed to the encoder per chunk (~1 MiB, whole frames). */
const CHUNK_TARGET_BYTES = 1 << 20

let flacModulePromise: Promise<any> | null = null

/** Load + ready the libflacjs module (memoised; ~200KB wasm instantiation). */
/**
 * Load + ready the libflac WASM module.
 *
 * EXPORTED so the encoder-driver's error paths (init failure, encode-after-
 * destroy, double-destroy) can be tested directly. Without this, those tests
 * silently SKIPPED — which is worse than failing, because the suite stayed
 * green while the branches were unexercised (found 2026-08-13).
 */
export async function loadFlac (): Promise<any> {
  if (!flacModulePromise) {
    flacModulePromise = (async () => {
      const mod = await import('libflacjs/dist/libflac.js')
      const Flac = (mod as any).default ?? mod
      if (Flac.isReady() !== true) {
        await new Promise<void>((resolve) => Flac.on('ready', () => { resolve() }))
      }
      return Flac
    })()
  }
  return await flacModulePromise
}

/**
 * Split interleaved little-endian PCM bytes into per-channel Int32Array
 * sample buffers (the shape libflac's encoder consumes).
 * Sign-extends 8/16/24-bit samples correctly; 8-bit WAV is UNSIGNED per the
 * RIFF spec (offset-128), 16/24-bit are signed two's-complement.
 */
export function deinterleavePcm (
  bytes: Uint8Array,
  channels: number,
  bitsPerSample: number
): Int32Array[] {
  const bytesPerSample = bitsPerSample / 8
  const frameBytes = channels * bytesPerSample
  const frames = Math.floor(bytes.length / frameBytes)
  const out: Int32Array[] = []
  for (let c = 0; c < channels; c++) { out.push(new Int32Array(frames)) }

  for (let f = 0; f < frames; f++) {
    const frameOff = f * frameBytes
    for (let c = 0; c < channels; c++) {
      const o = frameOff + c * bytesPerSample
      let v: number
      if (bitsPerSample === 8) {
        v = bytes[o] - 128 // RIFF 8-bit is unsigned
      } else if (bitsPerSample === 16) {
        v = bytes[o] | (bytes[o + 1] << 8)
        if (v & 0x8000) { v -= 0x10000 }
      } else { // 24
        v = bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16)
        if (v & 0x800000) { v -= 0x1000000 }
      }
      out[c][f] = v
    }
  }
  return out
}

/** Locate the data chunk's byte offset within the WAV (re-walk, bounded). */
async function findDataOffset (blob: Blob, scanLimit = 1024 * 1024): Promise<{ offset: number, length: number }> {
  const head = new DataView(await blob.slice(0, Math.min(scanLimit, blob.size)).arrayBuffer())
  const te = new TextDecoder('ascii')
  const fourcc = (o: number): string => te.decode(new Uint8Array(head.buffer, o, 4))
  let offset = 12
  while (offset + 8 <= head.byteLength) {
    const id = fourcc(offset)
    const size = head.getUint32(offset + 4, true)
    if (id === 'data') { return { offset: offset + 8, length: size } }
    offset += 8 + size + (size % 2)
  }
  throw new Error('data chunk not found (file changed since metadata parse?)')
}

/**
 * Encode a WAV Blob to FLAC bytes, chunked.
 *
 * @param blob the source WAV file
 * @param meta the file's parsed metadata — MUST be flacEncodable
 * @param onProgress optional progress callback (per chunk)
 */
export async function encodeWavToFlac (
  blob: Blob,
  meta: WavMetadata,
  onProgress?: (p: FlacEncodeProgress) => void
): Promise<FlacEncodeResult> {
  if (!meta.flacEncodable) {
    throw new Error(`not losslessly encodable: ${meta.reasons.join('; ')}`)
  }
  const channels = meta.channels as number
  const bitsPerSample = meta.bitsPerSample as number
  const sampleRate = meta.sampleRate as number

  const Flac = await loadFlac()

  // NOTE (§118): we deliberately do NOT import `libflacjs/lib/encoder` here.
  // It is a UMD module whose shadowed `require` makes rollup emit a throwing
  // `_commonjs-dynamic-modules` stub — the build succeeds, the worker loads,
  // and encoding fails at RUNTIME (silently, because the transcode stage fails
  // open). FlacStreamEncoder reimplements the three methods we used directly
  // on the WASM module. See flac-encoder-core.ts for the full history.
  const settings = { compression: 5, verify: true, library: 'libflac-wasm-direct' }
  const encoder = new FlacStreamEncoder(Flac, {
    sampleRate, channels, bitsPerSample, compression: settings.compression, verify: settings.verify
  })

  try {
    const { offset, length } = await findDataOffset(blob)
    // clamp to the actual blob (a truncated file must not read past EOF)
    const dataEnd = Math.min(offset + length, blob.size)

    const frameBytes = channels * (bitsPerSample / 8)
    // whole frames per chunk
    const chunkBytes = Math.max(frameBytes, Math.floor(CHUNK_TARGET_BYTES / frameBytes) * frameBytes)

    let pos = offset
    let bytesIn = 0
    while (pos < dataEnd) {
      const end = Math.min(pos + chunkBytes, dataEnd)
      const chunk = new Uint8Array(await blob.slice(pos, end).arrayBuffer())
      // drop a trailing partial frame (can only happen on a truncated file)
      const whole = chunk.length - (chunk.length % frameBytes)
      if (whole > 0) {
        const channelsData = deinterleavePcm(chunk.subarray(0, whole), channels, bitsPerSample)
        const ok = encoder.encode(channelsData) as boolean | undefined
        if (ok === false) {
          throw new Error('libflac encode() returned false (verify failure or internal error)')
        }
        bytesIn += whole
      }
      pos = end
      onProgress?.({ bytesIn, bytesOut: 0, totalBytesIn: dataEnd - offset })
    }

    encoder.encode() // finalise the stream
    const flacBytes: Uint8Array = encoder.getSamples()
    if (flacBytes.length < 4 || String.fromCharCode(...flacBytes.slice(0, 4)) !== 'fLaC') {
      throw new Error('encoder produced no valid FLAC stream')
    }
    onProgress?.({ bytesIn, bytesOut: flacBytes.length, totalBytesIn: dataEnd - offset })
    return { flacBytes, bytesIn, settings }
  } finally {
    encoder.destroy()
  }
}

/**
 * Decode FLAC bytes back to per-channel PCM (TEST/verification use — the
 * lossless-parity proof decodes what we encoded and compares samples).
 * Not shipped down the browser hot path.
 */
export async function decodeFlacToPcm (flacBytes: Uint8Array): Promise<{
  channels: Int32Array[]
  sampleRate: number
  bitsPerSample: number
}> {
  const Flac = await loadFlac()
  const { Decoder } = await import('libflacjs/lib/decoder')
  const decoder = new Decoder(Flac, { verify: true })
  try {
    const ok = decoder.decode(flacBytes)
    if (!ok) { throw new Error('FLAC decode failed') }
    const meta = decoder.metadata
    const raw: Uint8Array[] = decoder.getSamples() // per-channel byte views
    const bits = meta.bitsPerSample ?? meta.bps
    // libflacjs's decoder WIDENS samples to whole int16/int32 slots: 8-bit
    // audio comes back as 2 bytes/sample (probed empirically — 8 samples =>
    // 16 bytes). So derive bytes-per-sample from the ACTUAL buffer length,
    // not the nominal bit depth.
    const channels = raw.map((c) => {
      // NOTE: metadata.total_samples is 0 in streaming mode (probed) — derive
      // the count from the buffer. libflacjs widens samples to POWER-OF-TWO
      // slots (probed empirically): ≤16-bit → int16 (2 bytes), 17–32-bit →
      // int32 (4 bytes). There is NO packed-3-byte case.
      const bytesPer = bits <= 16 ? 2 : 4
      const n = Math.floor(c.byteLength / bytesPer)
      const actualBytesPer = bytesPer
      const outCh = new Int32Array(n)
      const dv = new DataView(c.buffer, c.byteOffset, c.byteLength)
      for (let i = 0; i < n; i++) {
        // only the two probed widths exist (see bytesPer above)
        outCh[i] = actualBytesPer === 2 ? dv.getInt16(i * 2, true) : dv.getInt32(i * 4, true)
      }
      return outCh
    })
    return { channels, sampleRate: meta.sampleRate ?? meta.sample_rate, bitsPerSample: bits }
  } finally {
    decoder.destroy()
  }
}
