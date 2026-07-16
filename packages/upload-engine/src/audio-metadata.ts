/**
 * Lightweight audio header parsing (WAV RIFF + FLAC STREAMINFO) to extract
 * duration/sampleRate client-side without ffmpeg. Reads only the first few
 * KB of the file. Opus and anything unrecognized returns undefined fields —
 * the server (ffmpeg identify) remains authoritative; these values are used
 * for the signing request's duration (project-limit accounting) and UI.
 */

export interface AudioMetadata {
  durationMs?: number
  sampleRateHz?: number
  format?: 'wav' | 'flac' | 'unknown'
}

const readAscii = (view: DataView, offset: number, length: number): string => {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += String.fromCharCode(view.getUint8(offset + i))
  }
  return out
}

/** Parse WAV RIFF fmt + data chunk sizes → duration. */
const parseWav = (view: DataView): AudioMetadata | undefined => {
  if (view.byteLength < 44) return undefined
  if (readAscii(view, 0, 4) !== 'RIFF' || readAscii(view, 8, 4) !== 'WAVE') {
    return undefined
  }
  let offset = 12
  let byteRate: number | undefined
  let sampleRateHz: number | undefined
  let dataBytes: number | undefined
  while (offset + 8 <= view.byteLength) {
    const chunkId = readAscii(view, offset, 4)
    const chunkSize = view.getUint32(offset + 4, true)
    if (chunkId === 'fmt ') {
      if (offset + 16 <= view.byteLength) {
        sampleRateHz = view.getUint32(offset + 12, true)
        byteRate = view.getUint32(offset + 16, true)
      }
    } else if (chunkId === 'data') {
      dataBytes = chunkSize
      break // data payload follows; header scan complete
    }
    offset += 8 + chunkSize + (chunkSize % 2)
  }
  if (byteRate === undefined || byteRate === 0 || dataBytes === undefined) {
    return { format: 'wav', sampleRateHz }
  }
  return {
    format: 'wav',
    sampleRateHz,
    durationMs: Math.round((dataBytes / byteRate) * 1000)
  }
}

/** Parse FLAC STREAMINFO block → duration + sample rate. */
const parseFlac = (view: DataView): AudioMetadata | undefined => {
  if (view.byteLength < 42) return undefined
  if (readAscii(view, 0, 4) !== 'fLaC') return undefined
  // First metadata block header at offset 4; STREAMINFO is always first.
  const blockType = view.getUint8(4) & 0x7f
  if (blockType !== 0) return { format: 'flac' }
  // STREAMINFO payload starts at offset 8.
  // Bytes 10..12 (payload offsets): sample rate (20 bits) + channels + bps + total samples (36 bits).
  const base = 8
  const sampleRateHz =
    (view.getUint8(base + 10) << 12) |
    (view.getUint8(base + 11) << 4) |
    (view.getUint8(base + 12) >> 4)
  const totalSamplesHigh = view.getUint8(base + 13) & 0x0f
  const totalSamples =
    totalSamplesHigh * 2 ** 32 +
    view.getUint8(base + 14) * 2 ** 24 +
    view.getUint8(base + 15) * 2 ** 16 +
    view.getUint8(base + 16) * 2 ** 8 +
    view.getUint8(base + 17)
  if (sampleRateHz === 0) return { format: 'flac' }
  return {
    format: 'flac',
    sampleRateHz,
    durationMs:
      totalSamples > 0
        ? Math.round((totalSamples / sampleRateHz) * 1000)
        : undefined
  }
}

/** Probe the first bytes of an audio Blob for duration/sample-rate. */
export const probeAudioMetadata = async (
  blob: Blob
): Promise<AudioMetadata> => {
  const head = await blob.slice(0, 65536).arrayBuffer()
  const view = new DataView(head)
  return parseWav(view) ?? parseFlac(view) ?? { format: 'unknown' }
}
