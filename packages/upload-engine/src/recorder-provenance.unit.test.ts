/**
 * Recorder-provenance rule (2026-08-13) — client mirror of the server rule.
 *
 * The two directions are BOTH load-bearing and are tested separately:
 *  - a genuine digitised archive must UPLOAD FREELY however old it is (this is
 *    the capability being added);
 *  - a digital recorder claiming a pre-1971 date must be FLAGGED (the unset-
 *    clock class the old blanket 1971 rule existed to catch).
 * Relaxing one without the other either blocks real archives or admits
 * silently-wrong data.
 *
 * Fixtures are REAL metadata shapes taken from production
 * (core.stream_source_files.meta), not invented ones.
 */
import { describe, expect, test } from 'vitest'

import { analyzeFile } from './analyze'
import { createUploadItem } from './index'
import { checkRecordingProvenance, detectRecorder, historicalDateNotice } from './recorder-provenance'

const AUDIOMOTH_COMMENT = 'Recorded at 19:30:00 09/08/2025 (UTC-5) by AudioMoth 248D9B04645707D7 at medium gain while battery was 4.5V and temperature was 12.3C.'
const GUANO_BLOCK = 'GUANO|Version:1.0\nFirmware Version:4.7\nMake:Wildlife Acoustics, Inc.\nModel:Song Meter Micro\nSerial:2MM18874\nWA|Song Meter|Prefix:2MM18874'

describe('recorder provenance (client)', () => {
  describe('ACCEPTS genuine archival material', () => {
    test.each([
      ['1955-06-12T10:15:00.000Z', 'mid-century field recording'],
      ['1941-01-01T01:01:01.000Z', 'wartime archive'],
      ['1900-01-01T01:01:01.000Z', 'turn of the century'],
      ['1969-12-31T17:00:00.000Z', 'xeno-canto placeholder INSIDE the drift window'],
      ['1970-01-13T09:00:00.000Z', 'xeno-canto placeholder, mid-window']
    ])('%s (%s) is accepted with no recorder metadata', (ts) => {
      expect(checkRecordingProvenance({ timestampUtc: ts })).toBeUndefined()
    })

    test('an archive transcoded by ffmpeg (encoder tag only) is accepted', () => {
      expect(checkRecordingProvenance({
        timestampUtc: '1941-01-01T01:01:01.000Z',
        metadataEvidence: 'Lavf58.24.101'
      })).toBeUndefined()
    })
  })

  describe('FLAGS impossible digital-recorder dates', () => {
    test('AudioMoth claiming 1970 (flat battery)', () => {
      const problem = checkRecordingProvenance({
        timestampUtc: '1970-01-01T00:00:00.000Z',
        metadataEvidence: AUDIOMOTH_COMMENT
      })
      expect(problem).toMatch(/AudioMoth/)
      expect(problem).toMatch(/clock/)
    })

    test('Song Meter / GUANO claiming 1970', () => {
      const problem = checkRecordingProvenance({
        timestampUtc: '1970-01-05T12:00:00.000Z',
        metadataEvidence: GUANO_BLOCK
      })
      expect(problem).toBeDefined()
    })

    test('the GUANO marker ALONE is sufficient (no brand name present)', () => {
      // Mutation-guard: GUANO_BLOCK also contains "Wildlife Acoustics" and
      // "Song Meter", so dropping the GUANO pattern still passed the test
      // above. GUANO is an open standard used by recorders whose brand we do
      // NOT list, so it must stand on its own.
      const problem = checkRecordingProvenance({
        timestampUtc: '1970-01-05T12:00:00.000Z',
        metadataEvidence: 'GUANO|Version:1.0\nTimestamp:1970-01-05T12:00:00\nLength:60.000'
      })
      expect(problem).toBeDefined()
      expect(problem).toMatch(/cannot date from 1970/)
    })

    test('the message tells the user how to fix it', () => {
      const problem = checkRecordingProvenance({
        timestampUtc: '1970-01-01T00:00:00.000Z',
        metadataEvidence: AUDIOMOTH_COMMENT
      }) as string
      expect(problem).toMatch(/Correct the date|fix the recorder/i)
    })
  })

  describe('FLAGS absurd dates regardless of provenance', () => {
    test.each([
      ['0218-03-21T05:10:00.000Z'],
      ['1501-02-03T00:00:00.000Z']
    ])('%s is a parse failure', (ts) => {
      expect(checkRecordingProvenance({ timestampUtc: ts })).toMatch(/not a plausible recording date/)
    })
  })

  describe('FLAGS metadata contradiction (any brand)', () => {
    test('parsed 1901 vs embedded 2012', () => {
      const problem = checkRecordingProvenance({
        timestampUtc: '1901-12-09T09:28:05.000Z',
        metadataEvidence: 'Avisoft-RECORDER',
        metadataDateUtc: '2012-11-19T00:00:00'
      })
      expect(problem).toBeDefined()
    })

    test('unknown brand still caught by contradiction', () => {
      expect(checkRecordingProvenance({
        timestampUtc: '1985-11-19T00:00:00.000Z',
        metadataEvidence: 'SomeUnlistedDevice',
        metadataDateUtc: '2012-11-19T00:00:00'
      })).toMatch(/file’s own metadata says/)
    })

    test('a same-day/timezone difference is NOT a contradiction', () => {
      expect(checkRecordingProvenance({
        timestampUtc: '2012-11-19T23:00:00.000Z',
        metadataDateUtc: '2012-11-19T00:00:00'
      })).toBeUndefined()
    })
  })

  describe('modern recordings are untouched', () => {
    test.each([
      ['2025-08-09T19:30:00.000Z', AUDIOMOTH_COMMENT],
      ['2024-01-15T14:30:00.000Z', GUANO_BLOCK],
      ['1990-06-01T00:00:00.000Z', undefined]
    ])('%s is accepted', (ts, evidence) => {
      expect(checkRecordingProvenance({ timestampUtc: ts, metadataEvidence: evidence })).toBeUndefined()
    })
  })

  describe('historicalDateNotice (advisory, never blocking)', () => {
    test('old date with no recorder metadata gets a nudge', () => {
      expect(historicalDateNotice('1955-06-12T10:15:00.000Z')).toMatch(/Unusually old date \(1955\)/)
    })

    test('modern dates get no nudge', () => {
      expect(historicalDateNotice('2024-01-15T14:30:00.000Z')).toBeUndefined()
    })

    test('recorder-tagged old dates get no nudge (they are REJECTED instead)', () => {
      expect(historicalDateNotice('1970-01-01T00:00:00.000Z', AUDIOMOTH_COMMENT)).toBeUndefined()
    })
  })

  test('detectRecorder identifies real production shapes', () => {
    expect(detectRecorder(AUDIOMOTH_COMMENT)).toMatch(/AudioMoth/)
    expect(detectRecorder(GUANO_BLOCK)).toBeDefined()
    expect(detectRecorder('{"album":"xeno-canto","artist":"Peter Boesman"}')).toBeUndefined()
    expect(detectRecorder('Lavf58.24.101')).toBeUndefined()
    expect(detectRecorder(undefined)).toBeUndefined()
  })
})

/** End-to-end through analyzeFile, which is what the UI actually calls. */
describe('provenance through the analyze path', () => {
  const mk = (name: string): ReturnType<typeof createUploadItem> =>
    createUploadItem({ filename: name, relativePath: name, fileSizeBytes: 4096, streamId: 's1' })

  const wa = (v: DataView, o: number, s: string): void => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i))
  }

  const makeWavWithIcmt = (comment: string): Blob => {
    const cmt = new TextEncoder().encode(comment + '\0')
    const pad = cmt.length % 2
    const payload = 4 + 4 + 4 + cmt.length + pad
    const fmt = new ArrayBuffer(24)
    const fv = new DataView(fmt)
    wa(fv, 0, 'fmt '); fv.setUint32(4, 16, true)
    fv.setUint16(8, 1, true); fv.setUint16(10, 1, true)
    fv.setUint32(12, 48000, true); fv.setUint32(16, 96000, true)
    fv.setUint16(20, 2, true); fv.setUint16(22, 16, true)
    const list = new ArrayBuffer(8 + payload)
    const lv = new DataView(list)
    wa(lv, 0, 'LIST'); lv.setUint32(4, payload, true)
    wa(lv, 8, 'INFO'); wa(lv, 12, 'ICMT'); lv.setUint32(16, cmt.length, true)
    new Uint8Array(list, 20).set(cmt)
    const dataHdr = new ArrayBuffer(8)
    const dv = new DataView(dataHdr)
    wa(dv, 0, 'data'); dv.setUint32(4, 0, true)
    const riff = new ArrayBuffer(12)
    const rv = new DataView(riff)
    wa(rv, 0, 'RIFF'); rv.setUint32(4, 4 + fmt.byteLength + list.byteLength + 8, true); wa(rv, 8, 'WAVE')
    return new Blob([riff, fmt, list, dataHdr], { type: 'audio/wav' })
  }

  test('a historical FLAC archive stages cleanly (no error)', async () => {
    const r = await analyzeFile(mk('19550612_101500.flac'), new Blob([new Uint8Array(64)]), { mode: 'auto' } as unknown as Parameters<typeof analyzeFile>[2])
    expect(r.patch.timestampUtc).toBe('1955-06-12T10:15:00.000Z')
    expect(r.patch.analysisError).toBeUndefined()
    expect(r.patch.notice).toMatch(/Unusually old date/)
  })

  test('an AudioMoth WAV with an epoch-reset clock is flagged', async () => {
    // ICMT says 1970 AND names AudioMoth => impossible.
    const blob = makeWavWithIcmt('Recorded at 00:00:00 01/01/1970 (UTC) by AudioMoth 248D9B04645707D7 at medium gain')
    const r = await analyzeFile(mk('00000000.WAV'), blob, { mode: 'auto' } as unknown as Parameters<typeof analyzeFile>[2])
    expect(r.patch.analysisError).toMatch(/AudioMoth/)
  })

  test('a modern AudioMoth WAV is unaffected', async () => {
    const blob = makeWavWithIcmt(AUDIOMOTH_COMMENT)
    const r = await analyzeFile(mk('20250809_193000.WAV'), blob, { mode: 'auto' } as unknown as Parameters<typeof analyzeFile>[2])
    expect(r.patch.analysisError).toBeUndefined()
    expect(r.patch.notice).toBeUndefined()
  })
})
