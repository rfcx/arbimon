/**
 * FlacStreamEncoder — the hand-written WASM encoder driver (OPEN-ITEMS §118).
 *
 * This file replaced `libflacjs/lib/encoder` because that module's UMD wrapper
 * made rollup emit a throwing stub, which silently disabled the transcode in
 * every production build. Swapping a maintained library for ~140 lines of our
 * own code is the highest-risk change in that fix, so these tests pin the
 * properties that matter and that the parity suite does NOT cover:
 *
 *  1. BYTE-IDENTITY with the library we replaced. Not merely "also lossless" —
 *     identical. The ingest dedup is keyed on the uploaded file's sha1, so a
 *     different-but-valid stream would silently change every file's identity
 *     and defeat duplicate detection.
 *  2. NO RESOURCE LEAK across many encodes in one session (a real batch is
 *     hundreds to thousands of files in one tab).
 *  3. The ERROR PATHS this driver introduced: encode-after-destroy,
 *     double-destroy, finalise-with-no-audio.
 *
 * ⚠️ These tests initially SKIPPED silently because `loadFlac` was not
 * exported — the suite stayed green while the branches went unexercised. That
 * is worse than a failure, and is why `loadFlac` is exported now.
 */
import { describe, expect, test } from 'vitest'

import { decodeFlacToPcm, encodeWavToFlac, loadFlac } from './flac-encoder'
import { FlacStreamEncoder } from './flac-encoder-core'
import { parseWavMetadata } from './wav-metadata'

const wa = (v: DataView, o: number, s: string): void => {
  for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i))
}

/** 16-bit mono 48 kHz WAV with deterministic content. */
const makeWav = (frames: number, seed = 1): Blob => {
  const fmt = new ArrayBuffer(24)
  const fv = new DataView(fmt)
  wa(fv, 0, 'fmt '); fv.setUint32(4, 16, true)
  fv.setUint16(8, 1, true); fv.setUint16(10, 1, true)
  fv.setUint32(12, 48000, true); fv.setUint32(16, 96000, true)
  fv.setUint16(20, 2, true); fv.setUint16(22, 16, true)
  const pcmBytes = frames * 2
  const dh = new ArrayBuffer(8); const dv = new DataView(dh)
  wa(dv, 0, 'data'); dv.setUint32(4, pcmBytes, true)
  const pcm = new Int16Array(frames)
  for (let i = 0; i < frames; i++) pcm[i] = Math.round(9000 * Math.sin(i / (7 + seed)))
  const riff = new ArrayBuffer(12); const rv = new DataView(riff)
  wa(rv, 0, 'RIFF'); rv.setUint32(4, 4 + 24 + 8 + pcmBytes, true); wa(rv, 8, 'WAVE')
  return new Blob([riff, fmt, dh, pcm.buffer], { type: 'audio/wav' })
}

const mkEncoder = async (): Promise<FlacStreamEncoder> => {
  const flac = await loadFlac()
  return new FlacStreamEncoder(flac, {
    sampleRate: 48000, channels: 1, bitsPerSample: 16, compression: 5, verify: true
  })
}

describe('byte-identity with the replaced library', () => {
  /**
   * BYTE-IDENTICAL **AUDIO**, plus one DELIBERATE header difference.
   *
   * The original property was "byte-identical to the libflacjs Encoder we
   * replaced", guarding uploaded sha1s so ingest dedup keeps recognising
   * re-uploads. That guard is still the point — but since 2026-08-18
   * (OPEN-ITEMS 183) we deliberately declare the true total-sample count in
   * STREAMINFO, which the reference encoder leaves at 0 ("unknown").
   *
   * MEASURED: that changes EXACTLY two bytes, offsets 24-25, both inside
   * STREAMINFO's total-samples field (0xbb80 = 48000 = the 1s fixture).
   * Every audio frame is unchanged.
   *
   * The sha1 shift is ACCEPTABLE HERE because no browser-transcoded FLAC has
   * ever been ingested successfully (0 of 335 — they were all rejected for
   * the very missing duration this fixes), so there is no historical corpus
   * to dedup against. If that ever stops being true, changing these bytes
   * again would need a migration plan.
   *
   * So the assertion is now: same length, audio identical, and differences
   * confined to the total-samples field — which is a STRICTLY STRONGER
   * statement than the old blanket equality, because it also pins WHERE the
   * difference is allowed to be.
   */
  test('audio bytes identical to libflacjs Encoder; only the total-samples field differs', async () => {
    const wav = makeWav(48000)
    const meta = await parseWavMetadata(wav)
    const mine = (await encodeWavToFlac(wav, meta)).flacBytes

    const mod = await import('libflacjs/dist/libflac.js')
    const flac = (mod as { default?: unknown }).default ?? mod
    const ready = flac as { isReady: () => boolean, on: (e: string, cb: () => void) => void }
    if (!ready.isReady()) {
      await new Promise<void>(resolve => { ready.on('ready', () => { resolve() }) })
    }
    const { Encoder } = await import('libflacjs/lib/encoder')
    const reference = new (Encoder as new (f: unknown, o: unknown) => {
      encode: (d?: Int32Array[]) => boolean
      getSamples: () => Uint8Array
      destroy: () => void
    })(flac, { sampleRate: 48000, channels: 1, bitsPerSample: 16, compression: 5, verify: true })

    const raw = new Uint8Array(await wav.slice(44).arrayBuffer())
    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength)
    const frames = raw.length / 2
    const channel = new Int32Array(frames)
    for (let i = 0; i < frames; i++) channel[i] = view.getInt16(i * 2, true)
    reference.encode([channel])
    reference.encode()
    const theirs = reference.getSamples()
    reference.destroy()

    expect(mine.length).toBe(theirs.length)

    const differing: number[] = []
    for (let i = 0; i < mine.length; i++) if (mine[i] !== theirs[i]) differing.push(i)

    // STREAMINFO payload starts at byte 8; total-samples occupies the low 36
    // bits of the 8-byte word at payload offset 10, i.e. file bytes 18..25.
    // Only the bytes that actually carry a non-zero part of our count differ.
    expect(differing).toEqual([24, 25])

    // the reference declares 0; we declare the true count
    const totalOf = (b: Uint8Array): number =>
      ((b[21] & 0x0f) * 2 ** 32) + (b[22] * 2 ** 24) + (b[23] * 2 ** 16) + (b[24] * 2 ** 8) + b[25]
    expect(totalOf(theirs)).toBe(0)
    expect(totalOf(mine)).toBe(48000) // exactly the fixture's 1 second

    // and every audio frame is untouched (STREAMINFO block ends at byte 42)
    for (let i = 42; i < mine.length; i++) {
      if (mine[i] !== theirs[i]) throw new Error(`audio byte differs at ${i}`)
    }
  }, 120000)
})

describe('resource lifecycle', () => {
  test('many encodes in one session do not degrade (leak guard)', async () => {
    const times: number[] = []
    for (let i = 0; i < 20; i++) {
      const wav = makeWav(24000, i)
      const meta = await parseWavMetadata(wav)
      const started = performance.now()
      const out = await encodeWavToFlac(wav, meta)
      times.push(performance.now() - started)
      expect(String.fromCharCode(...out.flacBytes.slice(0, 4))).toBe('fLaC')
    }
    const firstFive = times.slice(0, 5).reduce((a, b) => a + b, 0) / 5
    const lastFive = times.slice(-5).reduce((a, b) => a + b, 0) / 5
    // A native-handle leak shows up as steadily rising encode time.
    expect(lastFive).toBeLessThan(firstFive * 5)
  }, 180000)

  test('encode after destroy throws instead of corrupting', async () => {
    const encoder = await mkEncoder()
    encoder.destroy()
    expect(() => encoder.encode([new Int32Array(10)])).toThrow(/destroyed/)
  }, 60000)

  test('double destroy is safe', async () => {
    const encoder = await mkEncoder()
    encoder.destroy()
    expect(() => { encoder.destroy() }).not.toThrow()
  }, 60000)

  test('finalising with no audio still yields a valid stream', async () => {
    const encoder = await mkEncoder()
    encoder.encode(undefined)
    const out = encoder.getSamples()
    encoder.destroy()
    expect(String.fromCharCode(...out.slice(0, 4))).toBe('fLaC')
  }, 60000)
})

describe('losslessness through the shipping path', () => {
  test('decode(encode(x)) is sample-exact', async () => {
    const wav = makeWav(96000)
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)
    const decoded = await decodeFlacToPcm(flacBytes)
    const raw = new Uint8Array(await wav.slice(44).arrayBuffer())
    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength)
    const frames = raw.length / 2
    let mismatches = 0
    for (let i = 0; i < frames; i++) {
      if (decoded.channels[0][i] !== view.getInt16(i * 2, true)) mismatches++
    }
    expect(mismatches).toBe(0)
  }, 120000)
})
