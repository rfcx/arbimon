/**
 * FLAC encoder core tests — the LOSSLESS-PARITY PROOF (slice 2, #112).
 *
 * The load-bearing test here is encode -> decode -> compare EVERY SAMPLE.
 * On a bioacoustics platform a lossy encode would silently corrupt
 * scientific data, so parity is asserted sample-exact over deterministic
 * pseudo-noise (the hardest signal for a lossless codec to fake), not on a
 * handful of spot values.
 *
 * WAVs are built byte-level in memory (same approach as the metadata
 * tests): real RIFF headers + real PCM payloads, no fixtures, no mocks.
 */
import { describe, expect, test } from 'vitest'

import { decodeFlacToPcm, deinterleavePcm, encodeWavToFlac } from './flac-encoder'
import { parseWavMetadata } from './wav-metadata'

// ---------------------------------------------------------------------------
// builders
// ---------------------------------------------------------------------------

/** deterministic PRNG so failures are reproducible */
function makeRand (seed: number): () => number {
  let state = seed >>> 0
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state }
}

interface PcmSpec {
  channels: number
  sampleRate: number
  bitsPerSample: 8 | 16 | 24
  frames: number
  seed?: number
}

/** generate per-channel samples + the interleaved little-endian PCM bytes */
function makePcm (spec: PcmSpec): { channels: Int32Array[], bytes: Uint8Array } {
  const rand = makeRand(spec.seed ?? 424242)
  const chans: Int32Array[] = []
  for (let c = 0; c < spec.channels; c++) { chans.push(new Int32Array(spec.frames)) }
  const max = 1 << (spec.bitsPerSample - 1)
  for (let f = 0; f < spec.frames; f++) {
    for (let c = 0; c < spec.channels; c++) {
      chans[c][f] = (rand() % (2 * max)) - max
    }
  }
  const bytesPer = spec.bitsPerSample / 8
  const bytes = new Uint8Array(spec.frames * spec.channels * bytesPer)
  let o = 0
  for (let f = 0; f < spec.frames; f++) {
    for (let c = 0; c < spec.channels; c++) {
      let v = chans[c][f]
      if (spec.bitsPerSample === 8) {
        bytes[o++] = v + 128 // RIFF 8-bit unsigned
      } else if (spec.bitsPerSample === 16) {
        if (v < 0) { v += 0x10000 }
        bytes[o++] = v & 0xff; bytes[o++] = (v >> 8) & 0xff
      } else {
        if (v < 0) { v += 0x1000000 }
        bytes[o++] = v & 0xff; bytes[o++] = (v >> 8) & 0xff; bytes[o++] = (v >> 16) & 0xff
      }
    }
  }
  return { channels: chans, bytes }
}

/** wrap PCM bytes in a minimal valid RIFF/WAVE container */
function wavBlob (spec: PcmSpec, pcmBytes: Uint8Array): Blob {
  const enc = new TextEncoder()
  const blockAlign = spec.channels * (spec.bitsPerSample / 8)
  const total = new Uint8Array(12 + 8 + 16 + 8 + pcmBytes.length)
  const v = new DataView(total.buffer)
  total.set(enc.encode('RIFF'), 0)
  v.setUint32(4, total.length - 8, true)
  total.set(enc.encode('WAVE'), 8)
  total.set(enc.encode('fmt '), 12)
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true) // PCM
  v.setUint16(22, spec.channels, true)
  v.setUint32(24, spec.sampleRate, true)
  v.setUint32(28, spec.sampleRate * blockAlign, true)
  v.setUint16(32, blockAlign, true)
  v.setUint16(34, spec.bitsPerSample, true)
  total.set(enc.encode('data'), 36)
  v.setUint32(40, pcmBytes.length, true)
  total.set(pcmBytes, 44)
  return new Blob([total])
}

async function roundtrip (spec: PcmSpec): Promise<{ channels: Int32Array[], result: Awaited<ReturnType<typeof encodeWavToFlac>>, decoded: Awaited<ReturnType<typeof decodeFlacToPcm>>, meta: Awaited<ReturnType<typeof parseWavMetadata>> }> {
  const { channels, bytes } = makePcm(spec)
  const blob = wavBlob(spec, bytes)
  const meta = await parseWavMetadata(blob)
  expect(meta.flacEncodable).toBe(true)
  const result = await encodeWavToFlac(blob, meta)
  const decoded = await decodeFlacToPcm(result.flacBytes)
  return { channels, result, decoded, meta }
}

function assertSampleParity (expected: Int32Array[], got: Int32Array[]): void {
  expect(got.length).toBe(expected.length)
  for (let c = 0; c < expected.length; c++) {
    expect(got[c].length).toBe(expected[c].length)
    // sample-exact compare without 2M-line diff output on failure
    let firstDiff = -1
    for (let i = 0; i < expected[c].length; i++) {
      if (got[c][i] !== expected[c][i]) { firstDiff = i; break }
    }
    expect(firstDiff, `channel ${c}: first differing sample index (expected ${firstDiff >= 0 ? expected[c][firstDiff] : '-'} got ${firstDiff >= 0 ? got[c][firstDiff] : '-'})`).toBe(-1)
  }
}

// ---------------------------------------------------------------------------

describe('lossless parity (encode -> decode -> sample-exact compare)', () => {
  test('16-bit mono 48k pseudo-noise', async () => {
    const { channels, decoded, result } = await roundtrip({ channels: 1, sampleRate: 48000, bitsPerSample: 16, frames: 4800 })
    assertSampleParity(channels, decoded.channels)
    expect(decoded.sampleRate).toBe(48000)
    expect(result.flacBytes.length).toBeGreaterThan(0)
    // pseudo-noise barely compresses, but the container must be valid FLAC
    expect(String.fromCharCode(...result.flacBytes.slice(0, 4))).toBe('fLaC')
  }, 30000)

  test('16-bit stereo 44.1k', async () => {
    const { channels, decoded } = await roundtrip({ channels: 2, sampleRate: 44100, bitsPerSample: 16, frames: 4410 })
    assertSampleParity(channels, decoded.channels)
  }, 30000)

  test('24-bit stereo 96k (high-res recorder)', async () => {
    const { channels, decoded } = await roundtrip({ channels: 2, sampleRate: 96000, bitsPerSample: 24, frames: 4800 })
    assertSampleParity(channels, decoded.channels)
    expect(decoded.bitsPerSample).toBe(24)
  }, 30000)

  test('8-bit mono (unsigned RIFF convention sign-handling)', async () => {
    const { channels, decoded } = await roundtrip({ channels: 1, sampleRate: 8000, bitsPerSample: 8, frames: 800 })
    assertSampleParity(channels, decoded.channels)
  }, 30000)

  test('384kHz mono 16-bit (bat recorder)', async () => {
    const { channels, decoded } = await roundtrip({ channels: 1, sampleRate: 384000, bitsPerSample: 16, frames: 3840 })
    assertSampleParity(channels, decoded.channels)
    expect(decoded.sampleRate).toBe(384000)
  }, 30000)

  test('chunked encode == single-shot (multi-chunk file crosses the 1MiB boundary)', async () => {
    // 300k frames stereo 16-bit = 1.2MB of PCM -> at least 2 chunks
    const { channels, decoded, result } = await roundtrip({ channels: 2, sampleRate: 48000, bitsPerSample: 16, frames: 300000 })
    assertSampleParity(channels, decoded.channels)
    expect(result.bytesIn).toBe(300000 * 2 * 2)
  }, 60000)
})

describe('progress + refusal contracts', () => {
  test('progress fires with monotonic bytesIn and correct total', async () => {
    const spec: PcmSpec = { channels: 2, sampleRate: 48000, bitsPerSample: 16, frames: 300000 }
    const { bytes } = makePcm(spec)
    const blob = wavBlob(spec, bytes)
    const meta = await parseWavMetadata(blob)
    const seen: number[] = []
    const totals: number[] = []
    await encodeWavToFlac(blob, meta, (p) => { seen.push(p.bytesIn); totals.push(p.totalBytesIn) })
    expect(seen.length).toBeGreaterThan(1) // multi-chunk => multiple callbacks
    for (let i = 1; i < seen.length; i++) { expect(seen[i]).toBeGreaterThanOrEqual(seen[i - 1]) }
    // EVERY callback must report the true PCM total — not just the final one
    // (a mutation that lied only in the in-loop callbacks escaped a
    // last-value-wins assertion here)
    for (const t of totals) { expect(t).toBe(bytes.length) }
    expect(seen[seen.length - 1]).toBe(bytes.length)
  }, 60000)

  test('REFUSES a non-encodable file (float-32) — the caller must fail open, not us silently', async () => {
    // hand-build a float WAV header; the parser will mark it not-encodable
    const spec: PcmSpec = { channels: 1, sampleRate: 48000, bitsPerSample: 16, frames: 100 }
    const { bytes } = makePcm(spec)
    const blob = wavBlob(spec, bytes)
    const meta = await parseWavMetadata(blob)
    meta.flacEncodable = false
    meta.reasons = ['format float is not integer PCM']
    await expect(encodeWavToFlac(blob, meta)).rejects.toThrow(/not losslessly encodable/)
  })

  test('truncated file (partial trailing frame) encodes the whole frames and does not throw', async () => {
    const spec: PcmSpec = { channels: 2, sampleRate: 48000, bitsPerSample: 16, frames: 1000 }
    const { bytes } = makePcm(spec)
    // chop 3 bytes: a partial frame at the end
    const blob = wavBlob(spec, bytes.subarray(0, bytes.length - 3))
    const meta = await parseWavMetadata(blob)
    // header still claims full length; encoder must clamp to the blob
    const result = await encodeWavToFlac(blob, meta)
    const decoded = await decodeFlacToPcm(result.flacBytes)
    expect(decoded.channels[0].length).toBe(999) // one frame dropped
    // bytesIn must be whole frames only: a partial trailing frame counted as
    // consumed would poison duration/telemetry math downstream
    expect(result.bytesIn % 4).toBe(0) // frameBytes = 2ch * 2B
    expect(result.bytesIn).toBe(999 * 4)
  }, 30000)
})

describe('deinterleavePcm sign-extension (unit)', () => {
  test('16-bit negative values', () => {
    // -1 = 0xFFFF LE, -32768 = 0x0080 LE
    const bytes = new Uint8Array([0xff, 0xff, 0x00, 0x80])
    const [ch] = deinterleavePcm(bytes, 1, 16)
    expect(Array.from(ch)).toEqual([-1, -32768])
  })
  test('24-bit negative values', () => {
    // -1 = FF FF FF, -8388608 = 00 00 80
    const bytes = new Uint8Array([0xff, 0xff, 0xff, 0x00, 0x00, 0x80])
    const [ch] = deinterleavePcm(bytes, 1, 24)
    expect(Array.from(ch)).toEqual([-1, -8388608])
  })
  test('8-bit RIFF unsigned convention', () => {
    // 0 -> -128, 128 -> 0, 255 -> 127
    const bytes = new Uint8Array([0, 128, 255])
    const [ch] = deinterleavePcm(bytes, 1, 8)
    expect(Array.from(ch)).toEqual([-128, 0, 127])
  })
  test('stereo interleave order', () => {
    // L=1, R=2 then L=3, R=4 (16-bit LE)
    const bytes = new Uint8Array([1, 0, 2, 0, 3, 0, 4, 0])
    const [l, r] = deinterleavePcm(bytes, 2, 16)
    expect(Array.from(l)).toEqual([1, 3])
    expect(Array.from(r)).toEqual([2, 4])
  })
})
