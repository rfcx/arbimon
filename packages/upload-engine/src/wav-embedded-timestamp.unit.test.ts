import { describe, expect, it } from 'vitest'

import { extractEmbeddedTimestamp, formatOffset, parseAudioMothComment, parseGuanoTimestamp } from './wav-embedded-timestamp'

// -- helpers to build synthetic WAV headers ---------------------------------

const enc = new TextEncoder()

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

const guanoChunk = (text: string): Uint8Array => chunk('guan', enc.encode(text))

const listInfoIcmt = (comment: string): Uint8Array => {
  const icmt = chunk('ICMT', enc.encode(comment + '\0'))
  const body = new Uint8Array(4 + icmt.length)
  body.set(enc.encode('INFO'), 0)
  body.set(icmt, 4)
  return chunk('LIST', body)
}

const dataChunk = (): Uint8Array => chunk('data', new Uint8Array(4))

// -- GUANO field parsing ----------------------------------------------------

describe('parseGuanoTimestamp', () => {
  it('parses a naive timestamp (no zone)', () => {
    expect(parseGuanoTimestamp('2025-08-18T19:30:00')).toEqual({
      wallTime: '2025-08-18T19:30:00', source: 'guano'
    })
  })

  it('parses an offset timestamp', () => {
    expect(parseGuanoTimestamp('2025-08-18T19:30:00-07:00')).toEqual({
      wallTime: '2025-08-18T19:30:00', offsetMinutes: -420, source: 'guano'
    })
  })

  it('parses Z as UTC (offset 0 — distinct from no-zone)', () => {
    expect(parseGuanoTimestamp('2025-08-18T19:30:00Z')?.offsetMinutes).toBe(0)
  })

  it('parses positive half-hour offsets', () => {
    expect(parseGuanoTimestamp('2025-08-18T19:30:00+05:30')?.offsetMinutes).toBe(330)
  })

  it('accepts space separator and fractional seconds', () => {
    expect(parseGuanoTimestamp('2025-08-18 19:30:00.123')?.wallTime).toBe('2025-08-18T19:30:00')
  })

  it('rejects garbage', () => {
    expect(parseGuanoTimestamp('yesterday-ish')).toBeUndefined()
    expect(parseGuanoTimestamp('2025-18-40T99:99:99')).toBeDefined() // shape-valid; range is the caller's Date-validity problem
  })
})

// -- AudioMoth ICMT parsing -------------------------------------------------

describe('parseAudioMothComment', () => {
  it('parses the plain-UTC form', () => {
    expect(parseAudioMothComment(
      'Recorded at 19:30:00 18/08/2025 (UTC) by AudioMoth 24E1440136B2D6DA'
    )).toEqual({ wallTime: '2025-08-18T19:30:00', offsetMinutes: 0, source: 'icmt' })
  })

  it('parses negative whole-hour offsets — DD/MM order proven', () => {
    const parsed = parseAudioMothComment(
      'Recorded at 06:00:00 02/01/2025 (UTC-7) by AudioMoth X'
    )
    expect(parsed?.wallTime).toBe('2025-01-02T06:00:00') // 2 Jan, not 1 Feb
    expect(parsed?.offsetMinutes).toBe(-420)
  })

  it('parses positive offsets with minutes', () => {
    expect(parseAudioMothComment(
      'Recorded at 06:00:00 02/01/2025 (UTC+5:30) by AudioMoth X'
    )?.offsetMinutes).toBe(330)
  })

  it('parses negative offsets with minutes (sign covers the whole offset)', () => {
    expect(parseAudioMothComment(
      'Recorded at 06:00:00 02/01/2025 (UTC-7:30) by AudioMoth X'
    )?.offsetMinutes).toBe(-450)
  })

  it('rejects non-AudioMoth comments', () => {
    expect(parseAudioMothComment('Processed by SoX')).toBeUndefined()
  })
})

// -- chunk scanning ---------------------------------------------------------

describe('extractEmbeddedTimestamp', () => {
  it('finds a GUANO timestamp', async () => {
    const blob = wavWith(
      guanoChunk('GUANO|Version:1.0\nTimestamp:2025-08-18T19:30:00-05:00\nMake:AudioMoth'),
      dataChunk()
    )
    const found = await extractEmbeddedTimestamp(blob)
    // Assert the FIELDS this test is about rather than exact object equality:
    // extraction also returns `rawMetadata` (added 2026-08-13 for the
    // recorder-provenance rule), and a deep-equal here would fail on any
    // future additive field without anything actually being wrong.
    expect(found).toMatchObject({
      wallTime: '2025-08-18T19:30:00',
      offsetMinutes: -300,
      source: 'guano'
    })
  })

  it('carries the RAW metadata text (needed by the provenance rule)', async () => {
    const blob = wavWith(
      guanoChunk('GUANO|Version:1.0\nTimestamp:2025-08-18T19:30:00-05:00\nMake:AudioMoth'),
      dataChunk()
    )
    const found = await extractEmbeddedTimestamp(blob)
    // Deciding whether a pre-1971 date is a digitised archive or an unset
    // recorder clock requires knowing WHICH DEVICE the file claims to be from.
    expect(found?.rawMetadata).toMatch(/AudioMoth/)
  })

  it('finds an AudioMoth ICMT comment', async () => {
    const blob = wavWith(
      listInfoIcmt('Recorded at 19:30:00 18/08/2025 (UTC) by AudioMoth 24E144'),
      dataChunk()
    )
    expect((await extractEmbeddedTimestamp(blob))?.source).toBe('icmt')
  })

  it('prefers GUANO over ICMT when both exist', async () => {
    const blob = wavWith(
      listInfoIcmt('Recorded at 01:00:00 01/01/2020 (UTC) by AudioMoth X'),
      guanoChunk('Timestamp:2025-08-18T19:30:00'),
      dataChunk()
    )
    expect((await extractEmbeddedTimestamp(blob))?.source).toBe('guano')
  })

  it('returns undefined for a WAV without either chunk', async () => {
    expect(await extractEmbeddedTimestamp(wavWith(dataChunk()))).toBeUndefined()
  })

  it('returns undefined for non-WAV bytes', async () => {
    expect(await extractEmbeddedTimestamp(new Blob([new Uint8Array(64)]))).toBeUndefined()
  })

  it('stops scanning at the data chunk (bounded work)', async () => {
    // guan AFTER data must not be found — mirrors wav-metadata's scan rule
    const blob = wavWith(dataChunk(), guanoChunk('Timestamp:2025-08-18T19:30:00'))
    expect(await extractEmbeddedTimestamp(blob)).toBeUndefined()
  })

  it('case-insensitive Timestamp key, namespaced lines ignored', async () => {
    const blob = wavWith(
      guanoChunk('SB|Version:1\ntimestamp:2025-08-18T19:30:00\n'),
      dataChunk()
    )
    expect((await extractEmbeddedTimestamp(blob))?.wallTime).toBe('2025-08-18T19:30:00')
  })
})

describe('formatOffset', () => {
  it('formats zero as UTC', () => { expect(formatOffset(0)).toBe('UTC') })
  it('formats negative', () => { expect(formatOffset(-420)).toBe('-07:00') })
  it('formats half hours', () => { expect(formatOffset(330)).toBe('+05:30') })
})