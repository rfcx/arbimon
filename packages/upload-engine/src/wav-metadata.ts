/**
 * WAV (RIFF/RF64) header parser — browser-side, zero dependencies.
 *
 * Purpose (client-side FLAC encoding, 2026-08-11): before encoding a WAV to
 * FLAC in the browser, we must know exactly what the source is, because the
 * encoder decision is per-file:
 *   - PCM int 16/24-bit, <=8 channels  -> losslessly FLAC-encodable
 *   - float-32, >8ch, A-law/mu-law/ADPCM, or anything unrecognised
 *     -> DO NOT encode; fall open to uploading the original file unchanged
 *       (losslessness is the contract on a bioacoustics platform — when we
 *       cannot guarantee it, we do not touch the audio)
 *
 * The parsed metadata also TUNES the encode (bits per sample, channel count,
 * sample rate feed the FLAC stream config directly) and lets the UI show an
 * honest size estimate before starting.
 *
 * Reads ONLY the header chunks (bounded scan, default 1 MiB) — never the
 * whole file: callers pass a File/Blob and we slice. Field recorders
 * (AudioMoth, Song Meter, Zoom) emit plain RIFF with occasional extra chunks
 * (`junk`, `bext`, `iXML`, AudioMoth's `INFO`) before `data`; the scanner
 * walks chunks rather than assuming fmt@12.
 *
 * RF64 (>4 GiB WAV) is recognised and reported (isRf64) with sizes taken
 * from the ds64 chunk when present.
 */

/** WAVE format tags we can meet in the wild (subset we care about). */
export const WAVE_FORMAT = {
  PCM: 0x0001,
  IEEE_FLOAT: 0x0003,
  ALAW: 0x0006,
  MULAW: 0x0007,
  EXTENSIBLE: 0xfffe
} as const

export interface WavMetadata {
  /** container recognised at all (RIFF/WAVE or RF64/WAVE) */
  isWav: boolean
  isRf64: boolean
  /** raw format tag from fmt (after EXTENSIBLE resolution when possible) */
  formatTag: number | null
  /** human label for the format tag */
  format: 'pcm' | 'float' | 'alaw' | 'mulaw' | 'unknown' | null
  channels: number | null
  sampleRate: number | null
  bitsPerSample: number | null
  /** byte length of the data chunk (RF64: from ds64) */
  dataByteLength: number | null
  /** duration derived from data length / byte rate, seconds (null if unknowable) */
  durationSeconds: number | null
  /** all chunk ids seen while scanning (diagnostic + telemetry) */
  chunkIds: string[]
  /**
   * THE decision the encoder consumes:
   * true only when we can guarantee a lossless FLAC round-trip:
   * PCM integer, 8/16/24 bits, 1..8 channels, sane sample rate.
   */
  flacEncodable: boolean
  /** why not encodable (empty when flacEncodable) — shown in telemetry/UI */
  reasons: string[]
}

const te = new TextDecoder('ascii')

function fourcc (view: DataView, offset: number): string {
  return te.decode(new Uint8Array(view.buffer, view.byteOffset + offset, 4))
}

/**
 * Parse WAV metadata from the head of a Blob/File.
 * @param blob the file (only the first `scanLimit` bytes are read)
 * @param scanLimit bounded header scan, default 1 MiB — covers every field
 *   recorder we know of (AudioMoth INFO ~500 B, bext 602 B, iXML a few KiB)
 */
export async function parseWavMetadata (blob: Blob, scanLimit = 1024 * 1024): Promise<WavMetadata> {
  const meta: WavMetadata = {
    isWav: false,
    isRf64: false,
    formatTag: null,
    format: null,
    channels: null,
    sampleRate: null,
    bitsPerSample: null,
    dataByteLength: null,
    durationSeconds: null,
    chunkIds: [],
    flacEncodable: false,
    reasons: []
  }

  const head = new DataView(await blob.slice(0, Math.min(scanLimit, blob.size)).arrayBuffer())
  if (head.byteLength < 12) {
    meta.reasons.push('file too small for a RIFF header')
    return meta
  }

  const riffId = fourcc(head, 0)
  const waveId = fourcc(head, 8)
  if ((riffId !== 'RIFF' && riffId !== 'RF64') || waveId !== 'WAVE') {
    meta.reasons.push(`not a WAV container (got ${riffId}/${waveId})`)
    return meta
  }
  meta.isWav = true
  meta.isRf64 = riffId === 'RF64'

  // RF64: real sizes live in the ds64 chunk (the RIFF size field is -1)
  let rf64DataSize: number | null = null

  // chunk walk
  let offset = 12
  let byteRate: number | null = null
  while (offset + 8 <= head.byteLength) {
    const id = fourcc(head, offset)
    const size = head.getUint32(offset + 4, true)
    meta.chunkIds.push(id.trim())

    if (id === 'ds64' && offset + 8 + 28 <= head.byteLength) {
      // ds64: riffSize(8) dataSize(8) sampleCount(8) ...
      const lo = head.getUint32(offset + 8 + 8, true)
      const hi = head.getUint32(offset + 8 + 12, true)
      rf64DataSize = hi * 0x100000000 + lo
    }

    if (id === 'fmt ' && offset + 8 + 16 <= head.byteLength) {
      const base = offset + 8
      let tag = head.getUint16(base, true)
      meta.channels = head.getUint16(base + 2, true)
      meta.sampleRate = head.getUint32(base + 4, true)
      byteRate = head.getUint32(base + 8, true)
      meta.bitsPerSample = head.getUint16(base + 14, true)
      // WAVE_FORMAT_EXTENSIBLE: the real format is the first 2 bytes of the
      // 16-byte SubFormat GUID at base+24 (after cbSize at base+16)
      if (tag === WAVE_FORMAT.EXTENSIBLE && offset + 8 + 26 <= head.byteLength) {
        tag = head.getUint16(base + 24, true)
      }
      meta.formatTag = tag
      meta.format =
        tag === WAVE_FORMAT.PCM ? 'pcm'
          : tag === WAVE_FORMAT.IEEE_FLOAT ? 'float'
            : tag === WAVE_FORMAT.ALAW ? 'alaw'
              : tag === WAVE_FORMAT.MULAW ? 'mulaw'
                : 'unknown'
    }

    if (id === 'data') {
      // RF64 stores 0xFFFFFFFF here; use ds64's value
      meta.dataByteLength = size === 0xffffffff && rf64DataSize !== null ? rf64DataSize : size
      // `data` is normally last (audio follows); stop scanning
      break
    }

    // chunks are word-aligned: odd sizes are padded by one byte
    offset += 8 + size + (size % 2)
  }

  if (meta.dataByteLength !== null && byteRate) {
    meta.durationSeconds = meta.dataByteLength / byteRate
  }

  // ---- the encoder decision -------------------------------------------------
  if (meta.format !== 'pcm') {
    meta.reasons.push(`format ${meta.format ?? 'missing fmt chunk'} is not integer PCM`)
  }
  if (meta.bitsPerSample !== null && ![8, 16, 24].includes(meta.bitsPerSample)) {
    // 32-bit int PCM exists but FLAC's 32-bit support is inconsistent across
    // decoders — treat as not-guaranteed-lossless, fall open.
    meta.reasons.push(`${meta.bitsPerSample}-bit samples (lossless FLAC guaranteed only for 8/16/24)`)
  }
  if (meta.channels !== null && (meta.channels < 1 || meta.channels > 8)) {
    meta.reasons.push(`${meta.channels} channels (FLAC supports 1..8)`)
  }
  if (meta.sampleRate !== null && (meta.sampleRate < 1 || meta.sampleRate > 655350)) {
    meta.reasons.push(`sample rate ${meta.sampleRate} outside FLAC's representable range`)
  }
  if (meta.dataByteLength === null) {
    meta.reasons.push('no data chunk found in header scan')
  }
  if (meta.channels === null || meta.sampleRate === null || meta.bitsPerSample === null) {
    if (!meta.reasons.length) { meta.reasons.push('fmt chunk missing or truncated') }
  }

  meta.flacEncodable = meta.isWav && meta.reasons.length === 0
  return meta
}

/**
 * Estimated FLAC output size in bytes, for UI display before encoding.
 * Bioacoustic PCM typically compresses to 45-65% of the data size; we show
 * the conservative end so the estimate under-promises.
 */
export function estimateFlacBytes (meta: WavMetadata): number | null {
  if (!meta.flacEncodable || meta.dataByteLength === null) { return null }
  return Math.round(meta.dataByteLength * 0.65)
}