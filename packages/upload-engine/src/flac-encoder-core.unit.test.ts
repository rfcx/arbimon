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
  test('produces a BYTE-IDENTICAL stream to libflacjs Encoder', async () => {
    // If this ever fails, uploaded sha1s change and ingest dedup silently
    // stops recognising re-uploads. It is the single most important property
    // of this replacement.
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
    let differing = 0
    for (let i = 0; i < mine.length; i++) if (mine[i] !== theirs[i]) differing++
    expect(differing).toBe(0)
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
