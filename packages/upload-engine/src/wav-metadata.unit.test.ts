/**
 * WAV metadata parser tests (client-side FLAC encoding, 2026-08-11).
 *
 * Every case builds a real byte-level WAV in memory — no fixture files, no
 * mocking of the parser's input path. The builder writes genuine RIFF
 * structure so what's tested is byte layout handling, not a mirror of the
 * implementation.
 *
 * The load-bearing assertions are the flacEncodable DECISIONS: this flag
 * gates whether the encoder touches the audio at all, and a wrong `true` on
 * a float-32 file would silently re-quantise scientific data. Fail-open
 * cases therefore get exact reason assertions, not just flag checks.
 */
import { describe, expect, test } from 'vitest'

import { estimateFlacBytes, parseWavMetadata, WAVE_FORMAT } from './wav-metadata'

// ---------------------------------------------------------------------------
// byte-level WAV builder
// ---------------------------------------------------------------------------

interface BuildOpts {
  formatTag?: number
  channels?: number
  sampleRate?: number
  bitsPerSample?: number
  dataBytes?: number
  /** chunks inserted BEFORE fmt (recorder-style junk/bext) */
  preChunks?: Array<{ id: string, size: number }>
  /** chunks inserted between fmt and data */
  midChunks?: Array<{ id: string, size: number }>
  riffId?: string
  waveId?: string
  extensible?: boolean
  /** truncate the built buffer to this many bytes */
  truncateTo?: number
}

function buildWav (opts: BuildOpts = {}): Blob {
  const {
    formatTag = WAVE_FORMAT.PCM,
    channels = 1,
    sampleRate = 48000,
    bitsPerSample = 16,
    dataBytes = 96000, // 1s of 48k/16-bit mono
    preChunks = [],
    midChunks = [],
    riffId = 'RIFF',
    waveId = 'WAVE',
    extensible = false,
    truncateTo
  } = opts

  const enc = new TextEncoder()
  const parts: ArrayBuffer[] = []
  const chunk = (id: string, body: Uint8Array): ArrayBuffer => {
    const buf = new ArrayBuffer(8 + body.length + (body.length % 2))
    const view = new DataView(buf)
    new Uint8Array(buf, 0, 4).set(enc.encode(id))
    view.setUint32(4, body.length, true)
    new Uint8Array(buf, 8, body.length).set(body)
    return buf
  }

  for (const c of preChunks) { parts.push(chunk(c.id, new Uint8Array(c.size))) }

  // fmt chunk
  const fmtLen = extensible ? 40 : 16
  const fmt = new Uint8Array(fmtLen)
  const fv = new DataView(fmt.buffer)
  fv.setUint16(0, extensible ? WAVE_FORMAT.EXTENSIBLE : formatTag, true)
  fv.setUint16(2, channels, true)
  fv.setUint32(4, sampleRate, true)
  const blockAlign = channels * (bitsPerSample / 8)
  fv.setUint32(8, sampleRate * blockAlign, true) // byte rate
  fv.setUint16(12, blockAlign, true)
  fv.setUint16(14, bitsPerSample, true)
  if (extensible) {
    fv.setUint16(16, 22, true) // cbSize
    fv.setUint16(18, bitsPerSample, true) // valid bits
    fv.setUint32(20, 0, true) // channel mask
    fv.setUint16(24, formatTag, true) // SubFormat GUID first 2 bytes = real tag
  }
  parts.push(chunk('fmt ', fmt))

  for (const c of midChunks) { parts.push(chunk(c.id, new Uint8Array(c.size))) }

  // data chunk: header + a token payload (parser never reads audio bytes)
  const dataHeader = new ArrayBuffer(8)
  const dv = new DataView(dataHeader)
  new Uint8Array(dataHeader, 0, 4).set(enc.encode('data'))
  dv.setUint32(4, dataBytes, true)
  parts.push(dataHeader)

  // assemble RIFF
  const bodyLen = parts.reduce((n, p) => n + p.byteLength, 0)
  const total = new Uint8Array(12 + bodyLen)
  const tv = new DataView(total.buffer)
  total.set(enc.encode(riffId), 0)
  tv.setUint32(4, 4 + bodyLen + dataBytes, true)
  total.set(enc.encode(waveId), 8)
  let off = 12
  for (const p of parts) { total.set(new Uint8Array(p), off); off += p.byteLength }

  const out = truncateTo !== undefined ? total.slice(0, truncateTo) : total
  return new Blob([out])
}

// ---------------------------------------------------------------------------

describe('parseWavMetadata — the happy path (field-recorder shapes)', () => {
  test('plain AudioMoth-style WAV: PCM 16-bit mono 48k', async () => {
    const meta = await parseWavMetadata(buildWav())
    expect(meta.isWav).toBe(true)
    expect(meta.format).toBe('pcm')
    expect(meta.channels).toBe(1)
    expect(meta.sampleRate).toBe(48000)
    expect(meta.bitsPerSample).toBe(16)
    expect(meta.dataByteLength).toBe(96000)
    expect(meta.durationSeconds).toBeCloseTo(1, 5)
    expect(meta.flacEncodable).toBe(true)
    expect(meta.reasons).toEqual([])
  })

  test('junk/bext/iXML chunks before fmt do not break the walk (Song Meter / Zoom shape)', async () => {
    const meta = await parseWavMetadata(buildWav({
      preChunks: [{ id: 'JUNK', size: 92 }, { id: 'bext', size: 602 }],
      midChunks: [{ id: 'iXML', size: 1543 }] // odd size: exercises word-alignment padding
    }))
    expect(meta.flacEncodable).toBe(true)
    expect(meta.chunkIds).toEqual(['JUNK', 'bext', 'fmt', 'iXML', 'data'])
  })

  test('24-bit stereo 96k (high-res recorder) is encodable', async () => {
    const meta = await parseWavMetadata(buildWav({ channels: 2, sampleRate: 96000, bitsPerSample: 24, dataBytes: 96000 * 6 }))
    expect(meta.flacEncodable).toBe(true)
    expect(meta.bitsPerSample).toBe(24)
  })

  test('EXTENSIBLE wrapping PCM resolves the real format tag', async () => {
    const meta = await parseWavMetadata(buildWav({ extensible: true, formatTag: WAVE_FORMAT.PCM }))
    expect(meta.format).toBe('pcm')
    expect(meta.flacEncodable).toBe(true)
  })

  test('384kHz ultrasonic (bat recorder) is within FLAC range', async () => {
    const meta = await parseWavMetadata(buildWav({ sampleRate: 384000, dataBytes: 768000 }))
    expect(meta.flacEncodable).toBe(true)
  })
})

describe('parseWavMetadata — FAIL OPEN decisions (each with its stated reason)', () => {
  test('float-32 is NOT encodable — the scientific-data guard', async () => {
    const meta = await parseWavMetadata(buildWav({ formatTag: WAVE_FORMAT.IEEE_FLOAT, bitsPerSample: 32 }))
    expect(meta.flacEncodable).toBe(false)
    expect(meta.reasons.join(' ')).toMatch(/float/)
  })

  test('EXTENSIBLE wrapping float is also caught (the sneaky variant)', async () => {
    const meta = await parseWavMetadata(buildWav({ extensible: true, formatTag: WAVE_FORMAT.IEEE_FLOAT, bitsPerSample: 32 }))
    expect(meta.flacEncodable).toBe(false)
    expect(meta.format).toBe('float')
  })

  test('A-law / mu-law are not encodable', async () => {
    for (const tag of [WAVE_FORMAT.ALAW, WAVE_FORMAT.MULAW]) {
      const meta = await parseWavMetadata(buildWav({ formatTag: tag, bitsPerSample: 8 }))
      expect(meta.flacEncodable).toBe(false)
    }
  })

  test('32-bit integer PCM falls open (FLAC 32-bit support is not universal)', async () => {
    const meta = await parseWavMetadata(buildWav({ bitsPerSample: 32 }))
    expect(meta.flacEncodable).toBe(false)
    expect(meta.reasons.join(' ')).toMatch(/32-bit/)
  })

  test('>8 channels falls open (ambisonic rig)', async () => {
    const meta = await parseWavMetadata(buildWav({ channels: 12, dataBytes: 96000 * 12 }))
    expect(meta.flacEncodable).toBe(false)
    expect(meta.reasons.join(' ')).toMatch(/channels/)
  })

  test('not a WAV at all (random bytes)', async () => {
    const meta = await parseWavMetadata(new Blob([new Uint8Array(4096).fill(0x41)]))
    expect(meta.isWav).toBe(false)
    expect(meta.flacEncodable).toBe(false)
  })

  test('a FLAC file is recognised as not-WAV (already-encoded input must not re-encode)', async () => {
    const flacHead = new Uint8Array([0x66, 0x4c, 0x61, 0x43, 0, 0, 0, 0x22]) // "fLaC"
    const meta = await parseWavMetadata(new Blob([flacHead, new Uint8Array(1024)]))
    expect(meta.isWav).toBe(false)
  })

  test('truncated header (upload of a partial file) falls open, does not throw', async () => {
    const meta = await parseWavMetadata(buildWav({ truncateTo: 20 }))
    expect(meta.flacEncodable).toBe(false)
  })

  test('empty file falls open, does not throw', async () => {
    const meta = await parseWavMetadata(new Blob([]))
    expect(meta.isWav).toBe(false)
    expect(meta.reasons.join(' ')).toMatch(/too small/)
  })

  test('data chunk beyond the scan limit falls open (metadata-monster file)', async () => {
    const meta = await parseWavMetadata(
      buildWav({ preChunks: [{ id: 'iXML', size: 2_000_000 }] }),
      1024 * 1024 // 1 MiB scan limit; fmt+data sit past 2 MB of iXML
    )
    expect(meta.flacEncodable).toBe(false)
  })
})

describe('RF64 (>4 GiB WAV)', () => {
  test('recognised, sizes read from ds64', async () => {
    // hand-build: RF64 header + ds64 + fmt + data(size=0xFFFFFFFF)
    const enc = new TextEncoder()
    const buf = new Uint8Array(12 + (8 + 28) + (8 + 16) + 8)
    const v = new DataView(buf.buffer)
    buf.set(enc.encode('RF64'), 0)
    v.setUint32(4, 0xffffffff, true)
    buf.set(enc.encode('WAVE'), 8)
    let o = 12
    buf.set(enc.encode('ds64'), o); v.setUint32(o + 4, 28, true)
    // riffSize(8) then dataSize(8): dataSize = 6 GiB = 0x180000000
    v.setUint32(o + 8 + 8, 0x80000000, true) // lo
    v.setUint32(o + 8 + 12, 0x1, true) // hi
    o += 8 + 28
    buf.set(enc.encode('fmt '), o); v.setUint32(o + 4, 16, true)
    const b = o + 8
    v.setUint16(b, WAVE_FORMAT.PCM, true); v.setUint16(b + 2, 2, true)
    v.setUint32(b + 4, 192000, true); v.setUint32(b + 8, 192000 * 6, true)
    v.setUint16(b + 12, 6, true); v.setUint16(b + 14, 24, true)
    o += 8 + 16
    buf.set(enc.encode('data'), o); v.setUint32(o + 4, 0xffffffff, true)

    const meta = await parseWavMetadata(new Blob([buf]))
    expect(meta.isRf64).toBe(true)
    expect(meta.dataByteLength).toBe(0x180000000)
    expect(meta.flacEncodable).toBe(true)
    expect(meta.durationSeconds).toBeCloseTo(0x180000000 / (192000 * 6), 3)
  })
})

describe('estimateFlacBytes', () => {
  test('conservative 65% for encodable, null otherwise', async () => {
    const good = await parseWavMetadata(buildWav({ dataBytes: 1_000_000 }))
    expect(estimateFlacBytes(good)).toBe(650_000)
    const bad = await parseWavMetadata(buildWav({ formatTag: WAVE_FORMAT.IEEE_FLOAT, bitsPerSample: 32 }))
    expect(estimateFlacBytes(bad)).toBeNull()
  })
})
