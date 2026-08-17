/**
 * FLAC Vorbis-comment writing (2026-08-13) — recorder-provenance preservation.
 *
 * THE DEFECT THIS FIXES (measured, ours not inherited): our in-browser FLAC
 * transcode wrote no tags, so every transcoded WAV reached the server stripped
 * of its GUANO / AudioMoth metadata — device id, deployment, gain, battery,
 * temperature. The desktop uploader re-attached that metadata via ffmpeg; we
 * silently dropped it. The server persists these tags
 * (stream_source_files.meta), and 240,520 AudioMoth + 211,535 GUANO files
 * arrived in the 30 days before this change, so the loss was real and ongoing.
 *
 * The tests below pin BOTH halves: the metadata must survive, AND the file
 * must remain a byte-valid, decodable, LOSSLESS FLAC. A metadata feature that
 * corrupts audio would be far worse than the bug it fixes.
 */
import { describe, expect, test } from 'vitest'

import { TranscodeCache, withFlacTranscode } from './browser/flac-transcode'
import { decodeFlacToPcm, encodeWavToFlac } from './flac-encoder'
import { buildProvenanceComments, readFlacComments, writeFlacComments } from './flac-vorbis-comment'
import { createUploadItem } from './index'
import { extractEmbeddedTimestamp } from './wav-embedded-timestamp'
import { parseWavMetadata } from './wav-metadata'

const AUDIOMOTH_COMMENT =
  'Recorded at 19:30:00 09/08/2025 (UTC-5) by AudioMoth 248D9B04645707D7 at medium gain while battery was 4.5V and temperature was 12.3C.'

const wa = (v: DataView, o: number, s: string): void => {
  for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i))
}

/** A 16-bit mono PCM WAV, optionally carrying a LIST/INFO ICMT comment. */
const makeWav = (opts: { frames?: number, comment?: string } = {}): Blob => {
  const frames = opts.frames ?? 4800
  const fmt = new ArrayBuffer(24)
  const fv = new DataView(fmt)
  wa(fv, 0, 'fmt '); fv.setUint32(4, 16, true)
  fv.setUint16(8, 1, true); fv.setUint16(10, 1, true)
  fv.setUint32(12, 48000, true); fv.setUint32(16, 96000, true)
  fv.setUint16(20, 2, true); fv.setUint16(22, 16, true)

  let list: ArrayBuffer | undefined
  if (opts.comment !== undefined) {
    const cmt = new TextEncoder().encode(opts.comment + '\0')
    const pad = cmt.length % 2
    const payload = 4 + 4 + 4 + cmt.length + pad
    list = new ArrayBuffer(8 + payload)
    const lv = new DataView(list)
    wa(lv, 0, 'LIST'); lv.setUint32(4, payload, true)
    wa(lv, 8, 'INFO'); wa(lv, 12, 'ICMT'); lv.setUint32(16, cmt.length, true)
    new Uint8Array(list, 20).set(cmt)
  }

  const pcmBytes = frames * 2
  const dataHdr = new ArrayBuffer(8)
  const dv = new DataView(dataHdr)
  wa(dv, 0, 'data'); dv.setUint32(4, pcmBytes, true)
  const pcm = new Int16Array(frames)
  for (let i = 0; i < frames; i++) pcm[i] = Math.round(8000 * Math.sin(i / 9))

  const riff = new ArrayBuffer(12)
  const rv = new DataView(riff)
  wa(rv, 0, 'RIFF')
  rv.setUint32(4, 4 + fmt.byteLength + (list?.byteLength ?? 0) + 8 + pcmBytes, true)
  wa(rv, 8, 'WAVE')

  const parts: BlobPart[] = [riff, fmt]
  if (list !== undefined) parts.push(list)
  parts.push(dataHdr, pcm.buffer)
  return new Blob(parts, { type: 'audio/wav' })
}

describe('writeFlacComments', () => {
  test('round-trips a comment through a real encoded FLAC', async () => {
    const wav = makeWav()
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)

    const out = writeFlacComments(flacBytes, [
      { key: 'COMMENT', value: AUDIOMOTH_COMMENT },
      { key: 'ARTIST', value: 'AudioMoth 248D9B04645707D7' }
    ])
    const read = readFlacComments(out)
    expect(read.find(c => c.key === 'COMMENT')?.value).toBe(AUDIOMOTH_COMMENT)
    expect(read.find(c => c.key === 'ARTIST')?.value).toBe('AudioMoth 248D9B04645707D7')
  }, 60000)

  test('MERGES into the encoder’s existing block, keeping its vendor string', async () => {
    // libflac emits VORBIS_COMMENT with vendor "reference libFLAC ..." and 0
    // comments. Appending a SECOND block would be malformed, so we merge.
    const wav = makeWav()
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)
    const out = writeFlacComments(flacBytes, [{ key: 'COMMENT', value: 'x' }])

    let count = 0
    let offset = 4
    while (offset + 4 <= out.length) {
      const header = out[offset]
      const type = header & 0x7f
      const len = (out[offset + 1] << 16) | (out[offset + 2] << 8) | out[offset + 3]
      if (type === 4) count++
      offset += 4 + len
      if ((header & 0x80) !== 0) break
    }
    expect(count).toBe(1) // exactly ONE VORBIS_COMMENT block
  }, 60000)

  test('PRESERVES the encoder’s vendor string on merge', async () => {
    // The vendor string identifies the encoder that produced the stream and is
    // part of a well-formed FLAC. Dropping it is silent metadata damage that
    // no audio check would notice — mutation-guard.
    const wav = makeWav()
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)
    const out = writeFlacComments(flacBytes, [{ key: 'COMMENT', value: 'x' }])

    // read the vendor directly out of the block
    let offset = 4
    let vendor = ''
    while (offset + 4 <= out.length) {
      const header = out[offset]
      const type = header & 0x7f
      const len = (out[offset + 1] << 16) | (out[offset + 2] << 8) | out[offset + 3]
      if (type === 4) {
        const body = out.subarray(offset + 4, offset + 4 + len)
        const vlen = body[0] | (body[1] << 8) | (body[2] << 16) | (body[3] << 24)
        vendor = new TextDecoder().decode(body.subarray(4, 4 + vlen))
        break
      }
      offset += 4 + len
      if ((header & 0x80) !== 0) break
    }
    expect(vendor).toMatch(/libFLAC/)
  }, 60000)

  test('writes the 24-bit block length correctly for a LARGE comment', async () => {
    // FLAC block length is 24-bit big-endian across three bytes. A payload
    // over 64 KiB exercises the high byte; getting it wrong corrupts the whole
    // metadata chain. GUANO blocks can be sizeable, so this is realistic.
    const wav = makeWav()
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)
    const big = 'G'.repeat(70000)
    const out = writeFlacComments(flacBytes, [{ key: 'COMMENT', value: big }])

    expect(readFlacComments(out).find(c => c.key === 'COMMENT')?.value).toBe(big)
    // and the stream must still decode
    const decoded = await decodeFlacToPcm(out)
    expect(decoded.channels[0].length).toBeGreaterThan(0)
  }, 90000)

  test('the file remains byte-valid and LOSSLESSLY decodable after tagging', async () => {
    // The critical safety property: metadata must not corrupt audio.
    const wav = makeWav({ frames: 9600 })
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)

    const before = await decodeFlacToPcm(flacBytes)
    const tagged = writeFlacComments(flacBytes, [
      { key: 'COMMENT', value: AUDIOMOTH_COMMENT }
    ])
    const after = await decodeFlacToPcm(tagged)

    expect(String.fromCharCode(...tagged.slice(0, 4))).toBe('fLaC')
    expect(after.channels.length).toBe(before.channels.length)
    expect(after.channels[0].length).toBe(before.channels[0].length)
    let mismatches = 0
    for (let i = 0; i < before.channels[0].length; i++) {
      if (before.channels[0][i] !== after.channels[0][i]) mismatches++
    }
    expect(mismatches).toBe(0)
  }, 60000)

  test('FAILS OPEN on malformed input (never costs the user an upload)', () => {
    const notFlac = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
    expect(writeFlacComments(notFlac, [{ key: 'A', value: 'b' }])).toBe(notFlac)
    const tiny = new Uint8Array([0x66, 0x4c, 0x61, 0x43])
    expect(writeFlacComments(tiny, [{ key: 'A', value: 'b' }])).toBe(tiny)
    expect(readFlacComments(notFlac)).toEqual([])
  })

  test('no comments = unchanged bytes (identity)', async () => {
    const wav = makeWav()
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)
    expect(writeFlacComments(flacBytes, [])).toBe(flacBytes)
  }, 60000)

  test('replaces rather than duplicates a key written twice', async () => {
    const wav = makeWav()
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)
    const once = writeFlacComments(flacBytes, [{ key: 'COMMENT', value: 'first' }])
    const twice = writeFlacComments(once, [{ key: 'COMMENT', value: 'second' }])
    const read = readFlacComments(twice).filter(c => c.key === 'COMMENT')
    expect(read).toHaveLength(1)
    expect(read[0].value).toBe('second')
  }, 60000)

  test('handles non-ASCII metadata (UTF-8 byte lengths, not char counts)', async () => {
    const wav = makeWav()
    const meta = await parseWavMetadata(wav)
    const { flacBytes } = await encodeWavToFlac(wav, meta)
    const value = 'Grabado en Bogotá — 22.1°C — Ñuñoa 森'
    const out = writeFlacComments(flacBytes, [{ key: 'COMMENT', value }])
    expect(readFlacComments(out).find(c => c.key === 'COMMENT')?.value).toBe(value)
  }, 60000)
})

describe('buildProvenanceComments', () => {
  test('extracts the AudioMoth device into ARTIST, as the desktop app did', () => {
    const comments = buildProvenanceComments({
      rawMetadata: AUDIOMOTH_COMMENT,
      originalFilename: '20250809_193000.WAV'
    })
    expect(comments.find(c => c.key === 'COMMENT')?.value).toBe(AUDIOMOTH_COMMENT)
    expect(comments.find(c => c.key === 'ARTIST')?.value).toBe('AudioMoth 248D9B04645707D7')
    expect(comments.find(c => c.key === 'ORIGINALFILENAME')?.value).toBe('20250809_193000.WAV')
  })

  test('a GUANO block has no "by <device>" clause — COMMENT only', () => {
    const guano = 'GUANO|Version:1.0\nMake:Wildlife Acoustics, Inc.\nModel:Song Meter Micro\nSerial:2MM18874'
    const comments = buildProvenanceComments({ rawMetadata: guano })
    expect(comments.find(c => c.key === 'COMMENT')?.value).toBe(guano)
    expect(comments.find(c => c.key === 'ARTIST')).toBeUndefined()
  })

  test('no source metadata = no comments', () => {
    expect(buildProvenanceComments({})).toEqual([])
  })
})

describe('END-TO-END: transcode preserves provenance', () => {
  test('an AudioMoth WAV keeps its metadata through WAV→FLAC', async () => {
    const wav = makeWav({ comment: AUDIOMOTH_COMMENT })
    // sanity: the source really does carry it
    expect((await extractEmbeddedTimestamp(wav))?.rawMetadata).toMatch(/AudioMoth/)

    const cache = new TranscodeCache()
    const item = createUploadItem({
      filename: 'rec.wav', relativePath: 'rec.wav', fileSizeBytes: wav.size, streamId: 's1'
    })
    const prepare = withFlacTranscode(
      async () => ({ timestampUtc: '2025-08-09T19:30:00.000Z', checksumSha1: 'abc' }),
      cache,
      { enabled: true, minSizeBytes: 0 }
    )
    const result = await prepare(item, wav)
    expect(result.transcodedFilename).toBe('rec.flac')

    const encoded = cache.get(item.id)
    expect(encoded).toBeDefined()
    const bytes = new Uint8Array(await (encoded as Blob).arrayBuffer())

    // THE REGRESSION GUARD: before this change these were all absent.
    const asText = new TextDecoder('latin1').decode(bytes)
    expect(asText).toMatch(/AudioMoth/)
    expect(asText).toMatch(/248D9B04645707D7/)
    expect(asText).toMatch(/12\.3C/) // temperature from the fixture comment

    const comments = readFlacComments(bytes)
    expect(comments.find(c => c.key === 'COMMENT')?.value).toMatch(/AudioMoth/)
    expect(comments.find(c => c.key === 'ARTIST')?.value).toMatch(/248D9B04645707D7/)
  }, 90000)

  test('a WAV with NO recorder metadata still transcodes fine', async () => {
    const wav = makeWav()
    const cache = new TranscodeCache()
    const item = createUploadItem({
      filename: 'plain.wav', relativePath: 'plain.wav', fileSizeBytes: wav.size, streamId: 's1'
    })
    const prepare = withFlacTranscode(
      async () => ({ timestampUtc: '2025-08-09T19:30:00.000Z', checksumSha1: 'abc' }),
      cache,
      { enabled: true, minSizeBytes: 0 }
    )
    const result = await prepare(item, wav)
    expect(result.transcodedFilename).toBe('plain.flac')
    const bytes = new Uint8Array(await (cache.get(item.id) as Blob).arrayBuffer())
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('fLaC')
    // filename provenance is still recorded
    expect(readFlacComments(bytes).find(c => c.key === 'ORIGINALFILENAME')?.value).toBe('plain.wav')
  }, 90000)
})
