import { describe, expect, test } from 'vitest'

import { probeAudioMetadata } from './audio-metadata'

/** Build a minimal valid WAV header + data chunk. */
const makeWav = (
  sampleRate: number,
  seconds: number,
  channels = 1,
  bitsPerSample = 16
): Blob => {
  const byteRate = sampleRate * channels * (bitsPerSample / 8)
  const dataBytes = Math.round(byteRate * seconds)
  const header = new ArrayBuffer(44)
  const view = new DataView(header)
  const writeAscii = (offset: number, text: string): void => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i))
    }
  }
  writeAscii(0, 'RIFF')
  view.setUint32(4, 36 + dataBytes, true)
  writeAscii(8, 'WAVE')
  writeAscii(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, channels * (bitsPerSample / 8), true)
  view.setUint16(34, bitsPerSample, true)
  writeAscii(36, 'data')
  view.setUint32(40, dataBytes, true)
  return new Blob([header]) // header only; probe reads sizes, not payload
}

/** Build a minimal FLAC STREAMINFO header. */
const makeFlac = (sampleRate: number, totalSamples: number): Blob => {
  const buffer = new ArrayBuffer(42)
  const view = new DataView(buffer)
  const writeAscii = (offset: number, text: string): void => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i))
    }
  }
  writeAscii(0, 'fLaC')
  view.setUint8(4, 0x80) // last-block flag + STREAMINFO (type 0)
  view.setUint8(5, 0)
  view.setUint8(6, 0)
  view.setUint8(7, 34) // block length 34
  const base = 8
  // bytes 10..12: sample rate 20 bits + channels 3 bits + bps upper bit
  view.setUint8(base + 10, (sampleRate >> 12) & 0xff)
  view.setUint8(base + 11, (sampleRate >> 4) & 0xff)
  view.setUint8(base + 12, (sampleRate & 0x0f) << 4)
  // bytes 13..17: bps low nibble + 36-bit total samples (we use low 36)
  view.setUint8(base + 13, (totalSamples / 2 ** 32) & 0x0f)
  view.setUint8(base + 14, (totalSamples >>> 24) & 0xff)
  view.setUint8(base + 15, (totalSamples >>> 16) & 0xff)
  view.setUint8(base + 16, (totalSamples >>> 8) & 0xff)
  view.setUint8(base + 17, totalSamples & 0xff)
  return new Blob([buffer])
}

describe('probeAudioMetadata', () => {
  test('WAV: 48kHz 60s mono', async () => {
    const meta = await probeAudioMetadata(makeWav(48000, 60))
    expect(meta.format).toBe('wav')
    expect(meta.sampleRateHz).toBe(48000)
    expect(meta.durationMs).toBe(60_000)
  })

  test('FLAC: 44.1kHz 30s', async () => {
    const totalSamples = 44100 * 30
    const meta = await probeAudioMetadata(makeFlac(44100, totalSamples))
    expect(meta.format).toBe('flac')
    expect(meta.sampleRateHz).toBe(44100)
    expect(meta.durationMs).toBe(30_000)
  })

  test('unknown format', async () => {
    const meta = await probeAudioMetadata(new Blob(['OggS garbage not parsed']))
    expect(meta.format).toBe('unknown')
    expect(meta.durationMs).toBeUndefined()
  })
})
