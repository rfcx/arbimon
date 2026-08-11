/**
 * Transcode-stage tests (#112 slice 3): the wrapper's DECISIONS and the
 * fail-open contract. The encoder itself is parity-proven in
 * flac-encoder.unit.test.ts; here we prove the plumbing:
 *  - encodable WAV -> encoded blob cached, inner prepare sees FLAC bytes,
 *    result carries transcodedFilename/-SizeBytes
 *  - float WAV / small WAV / non-WAV / disabled -> original passed through
 *  - encoder failure -> FAIL OPEN to original (never block the upload)
 *  - TranscodingFileSource serves the cache first, falls through after release
 */
import { describe, expect, test } from 'vitest'

import { type PrepareFn } from '../engine'
import { type UploadItem } from '../types'
import { TranscodeCache, TranscodingFileSource, withFlacTranscode } from './flac-transcode'

// -- tiny WAV builders (PCM + float variants) --------------------------------

function wavBlob (formatTag: number, bitsPerSample: number, dataBytes: number): Blob {
  const enc = new TextEncoder()
  const pcm = new Uint8Array(dataBytes)
  for (let i = 0; i < pcm.length; i++) { pcm[i] = (i * 37) & 0xff }
  const hdr = new Uint8Array(44)
  const v = new DataView(hdr.buffer)
  hdr.set(enc.encode('RIFF'), 0); v.setUint32(4, 36 + pcm.length, true)
  hdr.set(enc.encode('WAVE'), 8); hdr.set(enc.encode('fmt '), 12)
  v.setUint32(16, 16, true); v.setUint16(20, formatTag, true); v.setUint16(22, 1, true)
  v.setUint32(24, 48000, true); v.setUint32(28, 48000 * (bitsPerSample / 8), true)
  v.setUint16(32, bitsPerSample / 8, true); v.setUint16(34, bitsPerSample, true)
  hdr.set(enc.encode('data'), 36); v.setUint32(40, pcm.length, true)
  return new Blob([hdr, pcm])
}

const item = (filename: string): UploadItem => ({
  id: `id-${filename}`,
  filename,
  relativePath: filename,
  state: 'preparing',
  fileSizeBytes: 0,
  siteId: 's'
} as unknown as UploadItem)

/** inner prepare that records what bytes it was given */
function recordingInner (): { fn: PrepareFn, seen: Blob[] } {
  const seen: Blob[] = []
  const fn: PrepareFn = async (_item, file) => {
    seen.push(file)
    return { timestampUtc: '2026-01-01T00:00:00.000Z', checksumSha1: 'x'.repeat(40) }
  }
  return { fn, seen }
}

describe('withFlacTranscode decisions', () => {
  test('encodable PCM WAV above threshold -> encoded; inner sees FLAC; result renamed', async () => {
    const cache = new TranscodeCache()
    const { fn, seen } = recordingInner()
    const decisions: string[] = []
    const prepare = withFlacTranscode(fn, cache, {
      minSizeBytes: 1000,
      onDecision: (_i, d, detail) => decisions.push(`${d}:${detail}`)
    })
    const it = item('rec.wav')
    const result = await prepare(it, wavBlob(1, 16, 96000))
    expect(decisions.some(d => d.startsWith('encoded:'))).toBe(true)
    expect(result.transcodedFilename).toBe('rec.flac')
    expect(result.transcodedSizeBytes).toBeGreaterThan(0)
    // inner ran on the ENCODED bytes (fLaC magic)
    const innerBytes = new Uint8Array(await seen[0].arrayBuffer())
    expect(String.fromCharCode(...innerBytes.slice(0, 4))).toBe('fLaC')
    // cache holds the encoded blob for the file source
    expect(cache.get(it.id)).toBeDefined()
  }, 30000)

  test('float WAV -> FAIL OPEN, original bytes, no rename', async () => {
    const cache = new TranscodeCache()
    const { fn, seen } = recordingInner()
    const decisions: string[] = []
    const prepare = withFlacTranscode(fn, cache, { minSizeBytes: 1000, onDecision: (_i, d) => decisions.push(d) })
    const it = item('float.wav')
    const blob = wavBlob(3, 32, 96000)
    const result = await prepare(it, blob)
    expect(decisions).toContain('failed-open')
    expect(result.transcodedFilename).toBeUndefined()
    expect(seen[0].size).toBe(blob.size) // original passed through
    expect(cache.get(it.id)).toBeUndefined()
  })

  test('below min size -> skipped, original passed through', async () => {
    const cache = new TranscodeCache()
    const { fn, seen } = recordingInner()
    const prepare = withFlacTranscode(fn, cache, { minSizeBytes: 10_000_000 })
    const blob = wavBlob(1, 16, 96000)
    await prepare(item('small.wav'), blob)
    expect(seen[0].size).toBe(blob.size)
  })

  test('non-WAV filename -> untouched (already-FLAC uploads must not re-encode)', async () => {
    const cache = new TranscodeCache()
    const { fn, seen } = recordingInner()
    const prepare = withFlacTranscode(fn, cache, { minSizeBytes: 0 })
    const blob = new Blob([new Uint8Array(50000)])
    await prepare(item('already.flac'), blob)
    expect(seen[0].size).toBe(blob.size)
    expect(cache.size()).toBe(0)
  })

  test('disabled toggle -> untouched', async () => {
    const cache = new TranscodeCache()
    const { fn, seen } = recordingInner()
    const prepare = withFlacTranscode(fn, cache, { enabled: false, minSizeBytes: 0 })
    const blob = wavBlob(1, 16, 96000)
    await prepare(item('rec.wav'), blob)
    expect(seen[0].size).toBe(blob.size)
    expect(cache.size()).toBe(0)
  })

  test('corrupt WAV header (parser can hardly bless it) -> fail open, upload proceeds', async () => {
    const cache = new TranscodeCache()
    const { fn, seen } = recordingInner()
    const prepare = withFlacTranscode(fn, cache, { minSizeBytes: 0 })
    const garbage = new Blob([new Uint8Array(9000).fill(0x55)])
    const result = await prepare(item('corrupt.wav'), garbage)
    expect(result.error).toBeUndefined()
    expect(seen[0].size).toBe(garbage.size)
  })
})

describe('TranscodingFileSource', () => {
  test('serves the cached FLAC first, inner source after release', async () => {
    const cache = new TranscodeCache()
    const original = new Blob([new Uint8Array([1, 2, 3])])
    const encoded = new Blob([new Uint8Array([9, 9])])
    const inner = { getFile: async () => original }
    const source = new TranscodingFileSource(inner, cache)

    cache.set('a', encoded)
    expect((await source.getFile('a'))?.size).toBe(2)
    cache.release('a')
    expect((await source.getFile('a'))?.size).toBe(3)
  })
})
