import { describe, expect, it } from 'vitest'

import { analyzeFile } from './analyze'
import { createUploadItem } from './index'

const enc = new TextEncoder()

// minimal WAV with a GUANO chunk (mirrors wav-embedded-timestamp tests)
const chunk = (id: string, body: Uint8Array): Uint8Array => {
  const padded = body.length % 2 === 1 ? body.length + 1 : body.length
  const out = new Uint8Array(8 + padded)
  out.set(enc.encode(id), 0)
  new DataView(out.buffer).setUint32(4, body.length, true)
  out.set(body, 8)
  return out
}
const wavWith = (...chunks: Uint8Array[]): Blob => {
  const bodyLen = chunks.reduce((n, c) => n + c.length, 0)
  const out = new Uint8Array(12 + bodyLen)
  out.set(enc.encode('RIFF'), 0)
  new DataView(out.buffer).setUint32(4, 4 + bodyLen, true)
  out.set(enc.encode('WAVE'), 8)
  let offset = 12
  for (const c of chunks) { out.set(c, offset); offset += c.length }
  return new Blob([out])
}
const guano = (ts: string): Uint8Array => chunk('guan', enc.encode(`Timestamp:${ts}\n`))
const dataChunk = (): Uint8Array => chunk('data', new Uint8Array(4))

const mkItem = (filename: string): ReturnType<typeof createUploadItem> =>
  createUploadItem({ filename, relativePath: `deploy1/${filename}`, fileSizeBytes: 1000, streamId: 'abc', initialState: 'analyzing' })

const plainBlob = new Blob([new Uint8Array(64)])

describe('analyzeFile — timezone ladder (auto)', () => {
  it('rung 1: filename offset wins over everything', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000+0700.wav'),
      wavWith(guano('2025-08-18T19:30:00-05:00'), dataChunk()),
      { mode: 'auto', siteTimezone: 'America/Bogota' }
    )
    expect(patch.timezoneSource).toBe('filename-offset')
    expect(patch.timezoneName).toBe('+07:00')
    expect(patch.timestampUtc).toBe('2025-08-18T12:30:00.000Z')
    expect(patch.localWallTime).toBe('2025-08-18T19:30:00')
    expect(patch.analysisError).toBeUndefined()
  })

  it('rung 2: GUANO offset (and GUANO wall time REPLACES filename time)', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'),
      wavWith(guano('2025-08-18T20:00:00-05:00'), dataChunk()),
      { mode: 'auto', siteTimezone: 'America/Bogota' }
    )
    expect(patch.timezoneSource).toBe('file-metadata')
    expect(patch.localWallTime).toBe('2025-08-18T20:00:00') // recorder clock, not filename
    expect(patch.timestampUtc).toBe('2025-08-19T01:00:00.000Z')
  })

  it('rung 3: site tz for a naive filename', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'),
      wavWith(dataChunk()),
      { mode: 'auto', siteTimezone: 'America/Bogota', siteName: 'El Site' }
    )
    expect(patch.timezoneSource).toBe('site-local')
    expect(patch.timezoneName).toBe('America/Bogota')
    expect(patch.timestampUtc).toBe('2025-08-19T00:30:00.000Z') // Bogota = UTC-5
    expect(patch.siteName).toBe('El Site')
  })

  it('rung 4: UTC fallback when the site has no tz', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'), wavWith(dataChunk()),
      { mode: 'auto' }
    )
    expect(patch.timezoneSource).toBe('utc-fallback')
    expect(patch.timestampUtc).toBe('2025-08-18T19:30:00.000Z')
  })

  it('zoneless GUANO does NOT fire rung 2 (falls to site rung)', async () => {
    const { patch } = await analyzeFile(
      mkItem('nodate.wav'),
      wavWith(guano('2025-08-18T19:30:00'), dataChunk()),
      { mode: 'auto', siteTimezone: 'America/Bogota' }
    )
    // filename has no timestamp; the embedded naive wall time carries,
    // interpreted in site tz
    expect(patch.timezoneSource).toBe('site-local')
    expect(patch.localWallTime).toBe('2025-08-18T19:30:00')
  })
})

describe('analyzeFile — forced modes', () => {
  it('site mode forces site tz and ignores embedded offset', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'),
      wavWith(guano('2025-08-18T20:00:00-05:00'), dataChunk()),
      { mode: 'site', siteTimezone: 'America/Bogota' }
    )
    expect(patch.timezoneSource).toBe('forced-site')
    expect(patch.localWallTime).toBe('2025-08-18T19:30:00') // filename time, not GUANO
  })

  it('site mode without a site tz = analysis error', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'), plainBlob,
      { mode: 'site' }
    )
    expect(patch.analysisError).toContain('no timezone')
  })

  it('utc mode forces UTC', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'), plainBlob,
      { mode: 'utc', siteTimezone: 'America/Bogota' }
    )
    expect(patch.timezoneSource).toBe('forced-utc')
    expect(patch.timestampUtc).toBe('2025-08-18T19:30:00.000Z')
  })

  it('metadata mode: GUANO with offset wins; filename time IGNORED', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'),
      wavWith(guano('2025-08-18T20:00:00-05:00'), dataChunk()),
      { mode: 'metadata', siteTimezone: 'America/Bogota' }
    )
    expect(patch.timezoneSource).toBe('file-metadata')
    expect(patch.localWallTime).toBe('2025-08-18T20:00:00') // GUANO time, NOT the filename's 19:30
    expect(patch.timestampUtc).toBe('2025-08-19T01:00:00.000Z')
    expect(patch.analysisError).toBeUndefined()
  })

  it('metadata mode: zoneless GUANO interpreted in the site tz', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'),
      wavWith(guano('2025-08-18T20:00:00'), dataChunk()),
      { mode: 'metadata', siteTimezone: 'America/Bogota' }
    )
    expect(patch.timezoneSource).toBe('file-metadata')
    expect(patch.timezoneName).toBe('America/Bogota')
    expect(patch.timestampUtc).toBe('2025-08-19T01:00:00.000Z') // Bogota = UTC-5
  })

  it('metadata mode: zoneless GUANO + no site tz falls to UTC', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'),
      wavWith(guano('2025-08-18T20:00:00'), dataChunk()),
      { mode: 'metadata' }
    )
    expect(patch.timezoneName).toBe('UTC')
    expect(patch.timestampUtc).toBe('2025-08-18T20:00:00.000Z')
  })

  it('metadata mode: WAV without embedded metadata = analysis error, NO filename fallback', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.wav'),
      wavWith(dataChunk()),
      { mode: 'metadata', siteTimezone: 'America/Bogota' }
    )
    expect(patch.analysisError).toContain('No embedded timestamp')
    expect(patch.timestampUtc).toBeUndefined() // the filename was NOT used
  })

  it('metadata mode: non-WAV = explicit unsupported error', async () => {
    const { patch } = await analyzeFile(
      mkItem('site_20250818_193000.flac'), plainBlob,
      { mode: 'metadata', siteTimezone: 'America/Bogota' }
    )
    expect(patch.analysisError).toContain('only supports WAV')
  })

  it('re-analysis CLEARS a previous mode\'s error (merge-patch regression)', async () => {
    // First analyze in metadata mode (errors: FLAC unsupported), then re-analyze
    // the same item in auto mode. Because engine.update() MERGES patches, the
    // second patch must carry analysisError: undefined EXPLICITLY — the merged
    // result below simulates the engine's { ...item, ...patch } exactly.
    const item = mkItem('site_20250818_193000.flac')
    const first = await analyzeFile(item, plainBlob, { mode: 'metadata' })
    expect(first.patch.analysisError).toContain('only supports WAV')
    const second = await analyzeFile(item, plainBlob, { mode: 'auto', siteTimezone: 'America/Bogota' })
    const merged = { ...item, ...first.patch, ...second.patch }
    expect(merged.analysisError).toBeUndefined()
    expect(merged.timestampUtc).toBeDefined()
  })
})

describe('analyzeFile — failure shapes', () => {
  it('no timestamp anywhere: stages with analysisError', async () => {
    const { patch } = await analyzeFile(mkItem('funny-noises.wav'), plainBlob, { mode: 'auto' })
    expect(patch.state).toBe('staged')
    expect(patch.analysisError).toContain('No recording timestamp')
  })

  it('directory + format populated from createUploadItem/probe', async () => {
    const item = mkItem('site_20250818_193000.flac')
    expect(item.directory).toBe('deploy1')
    const { patch } = await analyzeFile(item, plainBlob, { mode: 'utc' })
    expect(patch.fileFormat).toBe('flac')
  })
})
