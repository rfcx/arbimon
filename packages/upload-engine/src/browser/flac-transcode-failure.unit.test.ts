/**
 * Loud-failure reporting for a broken FLAC encoder (OPEN-ITEMS §118).
 *
 * WHY THIS EXISTS: `withFlacTranscode` fails OPEN — any encoder error returns
 * the original file. That is correct for ONE bad file and catastrophic as a
 * global posture. When the encoder could not load at all (a rollup UMD stub
 * that threw on every encode), this handler silently downgraded EVERY upload
 * to an un-transcoded WAV for two days, and a green "served-bundle-verified"
 * check missed it because the worker chunk fetched 200 while no encode ever
 * succeeded.
 *
 * So the contract under test is deliberately two-sided:
 *  - uploads MUST still succeed (fail-open preserved), and
 *  - the failure MUST be reported once per session (loud, but not a flood).
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { createUploadItem } from '../index'
import { resetEncoderFailureReporting, TranscodeCache, withFlacTranscode } from './flac-transcode'

const wa = (v: DataView, o: number, s: string): void => {
  for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i))
}

/** A losslessly-encodable 16-bit mono WAV. */
const makeWav = (frames = 4800): Blob => {
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
  for (let i = 0; i < frames; i++) pcm[i] = Math.round(6000 * Math.sin(i / 8))
  const riff = new ArrayBuffer(12); const rv = new DataView(riff)
  wa(rv, 0, 'RIFF'); rv.setUint32(4, 4 + 24 + 8 + pcmBytes, true); wa(rv, 8, 'WAVE')
  return new Blob([riff, fmt, dh, pcm.buffer], { type: 'audio/wav' })
}

const mkItem = (name = 'rec.wav'): ReturnType<typeof createUploadItem> =>
  createUploadItem({ filename: name, relativePath: name, fileSizeBytes: 9600, streamId: 's1' })

/** Stands in for the §118 failure: the encoder throws on every call. */
const brokenEncode = async (): Promise<never> => {
  throw new Error('Could not dynamically require "./utils/data-utils"')
}

describe('broken-encoder reporting', () => {
  beforeEach(() => { resetEncoderFailureReporting() })
  afterEach(() => { vi.restoreAllMocks() })

  test('uploads still SUCCEED when the encoder is broken (fail-open preserved)', async () => {
    const cache = new TranscodeCache()
    const prepare = withFlacTranscode(
      async () => ({ timestampUtc: '2025-01-01T00:00:00.000Z', checksumSha1: 'abc' }),
      cache,
      { enabled: true, minSizeBytes: 0, encode: brokenEncode as never }
    )
    const result = await prepare(mkItem(), makeWav())
    // no transcode happened, but the file is still preparable
    expect(result.transcodedFilename).toBeUndefined()
    expect(result.error).toBeUndefined()
    expect(cache.size()).toBe(0)
  }, 30000)

  test('reports the failure ONCE, with an actionable message', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const seen: string[] = []
    const cache = new TranscodeCache()
    const prepare = withFlacTranscode(
      async () => ({ timestampUtc: '2025-01-01T00:00:00.000Z', checksumSha1: 'abc' }),
      cache,
      {
        enabled: true,
        minSizeBytes: 0,
        encode: brokenEncode as never,
        onEncoderUnavailable: (detail) => seen.push(detail)
      }
    )
    // a realistic batch: many files, all failing the same way
    for (let i = 0; i < 25; i++) await prepare(mkItem(`rec-${i}.wav`), makeWav())

    expect(seen).toHaveLength(1) // once per session, not 25 times
    expect(seen[0]).toMatch(/dynamically require/)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toMatch(/UNCOMPRESSED/)
  }, 60000)

  test('a throwing telemetry hook never breaks the upload', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const cache = new TranscodeCache()
    const prepare = withFlacTranscode(
      async () => ({ timestampUtc: '2025-01-01T00:00:00.000Z', checksumSha1: 'abc' }),
      cache,
      {
        enabled: true,
        minSizeBytes: 0,
        encode: brokenEncode as never,
        onEncoderUnavailable: () => { throw new Error('telemetry exploded') }
      }
    )
    const result = await prepare(mkItem(), makeWav())
    expect(result.error).toBeUndefined()
  }, 30000)

  test('a WORKING encoder reports nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const seen: string[] = []
    const cache = new TranscodeCache()
    const prepare = withFlacTranscode(
      async () => ({ timestampUtc: '2025-01-01T00:00:00.000Z', checksumSha1: 'abc' }),
      cache,
      { enabled: true, minSizeBytes: 0, onEncoderUnavailable: (d) => seen.push(d) }
    )
    const result = await prepare(mkItem(), makeWav())
    expect(result.transcodedFilename).toBe('rec.flac')
    expect(seen).toHaveLength(0)
    expect(warn).not.toHaveBeenCalled()
  }, 60000)

  test('a SKIPPED file (not encodable) is not reported as a failure', async () => {
    // float-32 WAV: legitimately not losslessly encodable -> skip, not failure
    const fmt = new ArrayBuffer(24)
    const fv = new DataView(fmt)
    wa(fv, 0, 'fmt '); fv.setUint32(4, 16, true)
    fv.setUint16(8, 3, true) // IEEE float
    fv.setUint16(10, 1, true)
    fv.setUint32(12, 48000, true); fv.setUint32(16, 192000, true)
    fv.setUint16(20, 4, true); fv.setUint16(22, 32, true)
    const dh = new ArrayBuffer(8); const dv = new DataView(dh)
    wa(dv, 0, 'data'); dv.setUint32(4, 4096, true)
    const riff = new ArrayBuffer(12); const rv = new DataView(riff)
    wa(rv, 0, 'RIFF'); rv.setUint32(4, 4 + 24 + 8 + 4096, true); wa(rv, 8, 'WAVE')
    const floatWav = new Blob([riff, fmt, dh, new ArrayBuffer(4096)], { type: 'audio/wav' })

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const seen: string[] = []
    const prepare = withFlacTranscode(
      async () => ({ timestampUtc: '2025-01-01T00:00:00.000Z', checksumSha1: 'abc' }),
      new TranscodeCache(),
      { enabled: true, minSizeBytes: 0, onEncoderUnavailable: (d) => seen.push(d) }
    )
    await prepare(mkItem('float.wav'), floatWav)
    expect(seen).toHaveLength(0)
    expect(warn).not.toHaveBeenCalled()
  }, 30000)
})
