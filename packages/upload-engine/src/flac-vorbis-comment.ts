/**
 * Write Vorbis comments into an encoded FLAC stream.
 *
 * WHY THIS EXISTS — a real, measured data-loss defect in our own uploader.
 *
 * The desktop uploader converted WAV→FLAC with ffmpeg and DELIBERATELY
 * re-attached the recorder's metadata (`-metadata comment=… -metadata
 * artist=…`, arbimon-uploader `services/audio.js`). Our in-browser encoder
 * (#112) writes no tags at all, so every WAV we transcode arrives at the
 * server stripped of its provenance. Verified on a real encoded file: device
 * id, "AudioMoth", the recording timestamp and the temperature were all
 * absent, and re-reading the FLAC yielded no embedded timestamp.
 *
 * That metadata is not decoration. The server persists it
 * (`stream_source_files.meta`, via ffprobe `format.tags`), and production is
 * full of it — in the 30 days before 2026-08-13, 240,520 files carried
 * AudioMoth ICMT and 211,535 carried GUANO, with payloads like:
 *
 *   "Recorded at 19:30:00 09/08/2025 (UTC-5) by AudioMoth 248D9B04645707D7
 *    at medium gain while battery was 4.5V and temperature was 12.3C."
 *   "GUANO|Version:1.0;Make:Wildlife Acoustics;Model:Song Meter Micro;
 *    Serial:2MM18874;…"
 *
 * i.e. which device recorded it, at what gain, and the battery/temperature at
 * capture — irreplaceable field provenance, and the input to the
 * recorder-provenance date rule. Once the source WAV is discarded it cannot be
 * reconstructed.
 *
 * SCOPE OF THE LOSS (measured): only transcoded files are affected, and only
 * those over the 8 MiB transcode gate — so short 1-minute clips were safe
 * while longer/higher-rate deployments were not:
 *   AudioMoth 48k/16/mono 60s     5.5 MiB  -> not transcoded, tags kept
 *   AudioMoth 48k/16/mono 5min   27.5 MiB  -> tags LOST
 *   SM4 48k/16/stereo 10min     109.9 MiB  -> tags LOST
 *
 * IMPLEMENTATION NOTE: libflacjs exposes no VORBIS_COMMENT constructor (only
 * `_FLAC__stream_encoder_set_metadata`, with no way to build a metadata object
 * from JS), so the block is written directly into the encoded byte stream.
 * That is deterministic and testable, and it avoids depending on unexported
 * WASM internals.
 *
 * The encoder ALREADY emits a VORBIS_COMMENT block (vendor "reference libFLAC
 * 1.3.4 20220220", 0 comments), so this MERGES into that block and preserves
 * the vendor string rather than appending a second, illegal one.
 */

/** FLAC METADATA_BLOCK_HEADER type for VORBIS_COMMENT. */
const BLOCK_TYPE_VORBIS_COMMENT = 4

export interface VorbisComment {
  /** Field name, e.g. 'COMMENT'. Case-insensitive per spec; upper-cased. */
  key: string
  value: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const readU32le = (bytes: Uint8Array, offset: number): number =>
  (bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)) >>> 0

const writeU32le = (bytes: Uint8Array, offset: number, value: number): void => {
  bytes[offset] = value & 0xff
  bytes[offset + 1] = (value >>> 8) & 0xff
  bytes[offset + 2] = (value >>> 16) & 0xff
  bytes[offset + 3] = (value >>> 24) & 0xff
}

/** Build a VORBIS_COMMENT block BODY (vendor + comment list). */
const buildVorbisBody = (vendor: string, comments: VorbisComment[]): Uint8Array => {
  const vendorBytes = encoder.encode(vendor)
  const entries = comments.map(c => encoder.encode(`${c.key.toUpperCase()}=${c.value}`))
  const size =
    4 + vendorBytes.length +
    4 +
    entries.reduce((sum, e) => sum + 4 + e.length, 0)
  const out = new Uint8Array(size)
  let off = 0
  writeU32le(out, off, vendorBytes.length); off += 4
  out.set(vendorBytes, off); off += vendorBytes.length
  writeU32le(out, off, entries.length); off += 4
  for (const entry of entries) {
    writeU32le(out, off, entry.length); off += 4
    out.set(entry, off); off += entry.length
  }
  return out
}

/** Parse an existing VORBIS_COMMENT body → vendor + comments. */
const parseVorbisBody = (body: Uint8Array): { vendor: string, comments: VorbisComment[] } => {
  let off = 0
  const vendorLen = readU32le(body, off); off += 4
  const vendor = decoder.decode(body.subarray(off, off + vendorLen)); off += vendorLen
  const count = readU32le(body, off); off += 4
  const comments: VorbisComment[] = []
  for (let i = 0; i < count && off + 4 <= body.length; i++) {
    const len = readU32le(body, off); off += 4
    const text = decoder.decode(body.subarray(off, off + len)); off += len
    const eq = text.indexOf('=')
    if (eq > 0) comments.push({ key: text.slice(0, eq), value: text.slice(eq + 1) })
  }
  return { vendor, comments }
}

/**
 * Return a copy of `flacBytes` with `comments` present in its VORBIS_COMMENT
 * block, preserving the encoder's vendor string and any existing comments.
 *
 * FAILS OPEN: any malformed input returns the ORIGINAL bytes unchanged. A
 * metadata nicety must never cost a user their upload — the same discipline
 * the transcode stage itself follows.
 */
export const writeFlacComments = (
  flacBytes: Uint8Array,
  comments: VorbisComment[]
): Uint8Array => {
  try {
    if (comments.length === 0) return flacBytes
    if (flacBytes.length < 8) return flacBytes
    if (String.fromCharCode(flacBytes[0], flacBytes[1], flacBytes[2], flacBytes[3]) !== 'fLaC') {
      return flacBytes
    }

    // Walk the metadata block chain to find VORBIS_COMMENT (and the chain end).
    let offset = 4
    let vorbisStart = -1
    let vorbisLen = 0
    let vorbisIsLast = false
    let lastBlockStart = -1

    while (offset + 4 <= flacBytes.length) {
      const header = flacBytes[offset]
      const isLast = (header & 0x80) !== 0
      const type = header & 0x7f
      const len = (flacBytes[offset + 1] << 16) | (flacBytes[offset + 2] << 8) | flacBytes[offset + 3]
      if (offset + 4 + len > flacBytes.length) return flacBytes // truncated
      if (type === BLOCK_TYPE_VORBIS_COMMENT) {
        vorbisStart = offset
        vorbisLen = len
        vorbisIsLast = isLast
      }
      lastBlockStart = offset
      offset += 4 + len
      if (isLast) break
    }
    if (lastBlockStart < 0) return flacBytes

    const audioStart = offset

    let newBody: Uint8Array
    let replaceStart: number
    let replaceEnd: number
    let isLastFlag: boolean

    if (vorbisStart >= 0) {
      // MERGE into the existing block (keeps libflac's vendor string).
      const existing = parseVorbisBody(
        flacBytes.subarray(vorbisStart + 4, vorbisStart + 4 + vorbisLen)
      )
      const merged = [...existing.comments]
      for (const c of comments) {
        const key = c.key.toUpperCase()
        const at = merged.findIndex(m => m.key.toUpperCase() === key)
        if (at >= 0) merged[at] = { key, value: c.value }
        else merged.push({ key, value: c.value })
      }
      newBody = buildVorbisBody(existing.vendor, merged)
      replaceStart = vorbisStart
      replaceEnd = vorbisStart + 4 + vorbisLen
      isLastFlag = vorbisIsLast
    } else {
      // No VORBIS_COMMENT: append one at the end of the chain. The previous
      // last block must lose its is-last flag, and ours gains it.
      newBody = buildVorbisBody('', comments)
      replaceStart = audioStart
      replaceEnd = audioStart
      isLastFlag = true
    }

    if (newBody.length > 0xffffff) return flacBytes // block length is 24-bit

    const out = new Uint8Array(
      flacBytes.length - (replaceEnd - replaceStart) + 4 + newBody.length
    )
    out.set(flacBytes.subarray(0, replaceStart), 0)
    let w = replaceStart
    out[w] = (isLastFlag ? 0x80 : 0) | BLOCK_TYPE_VORBIS_COMMENT
    out[w + 1] = (newBody.length >>> 16) & 0xff
    out[w + 2] = (newBody.length >>> 8) & 0xff
    out[w + 3] = newBody.length & 0xff
    w += 4
    out.set(newBody, w); w += newBody.length
    out.set(flacBytes.subarray(replaceEnd), w)

    if (vorbisStart < 0 && lastBlockStart >= 0) {
      // we appended: clear is-last on the block that previously ended the chain
      out[lastBlockStart] = out[lastBlockStart] & 0x7f
    }
    return out
  } catch {
    return flacBytes // fail open
  }
}

/** Read the Vorbis comments back out of a FLAC stream (verification/tests). */
export const readFlacComments = (flacBytes: Uint8Array): VorbisComment[] => {
  try {
    if (flacBytes.length < 8) return []
    if (String.fromCharCode(flacBytes[0], flacBytes[1], flacBytes[2], flacBytes[3]) !== 'fLaC') {
      return []
    }
    let offset = 4
    while (offset + 4 <= flacBytes.length) {
      const header = flacBytes[offset]
      const isLast = (header & 0x80) !== 0
      const type = header & 0x7f
      const len = (flacBytes[offset + 1] << 16) | (flacBytes[offset + 2] << 8) | flacBytes[offset + 3]
      if (offset + 4 + len > flacBytes.length) return []
      if (type === BLOCK_TYPE_VORBIS_COMMENT) {
        return parseVorbisBody(flacBytes.subarray(offset + 4, offset + 4 + len)).comments
      }
      offset += 4 + len
      if (isLast) break
    }
    return []
  } catch {
    return []
  }
}

/**
 * Build the comment set that preserves a source WAV's recorder provenance.
 *
 * Field choice is deliberate: ffprobe maps FLAC Vorbis `COMMENT`→tags.comment
 * and `ARTIST`→tags.artist, which are exactly the two fields the server
 * already stores and the desktop uploader already used. Keeping the same
 * shape means `stream_source_files.meta` looks identical whether a file was
 * transcoded in the browser, by the desktop app, or not at all.
 */
export const buildProvenanceComments = (source: {
  /** Raw GUANO block / AudioMoth ICMT text from the source WAV. */
  rawMetadata?: string
  /** Original filename before transcode (kept for traceability). */
  originalFilename?: string
}): VorbisComment[] => {
  const out: VorbisComment[] = []
  if (source.rawMetadata !== undefined && source.rawMetadata !== '') {
    out.push({ key: 'COMMENT', value: source.rawMetadata })
    // AudioMoth writes the device into the comment as "by AudioMoth <id>";
    // surface it as ARTIST too, matching the desktop uploader's output.
    const device = source.rawMetadata.match(/by (AudioMoth [0-9A-Fa-f]+)/)
    if (device !== null) out.push({ key: 'ARTIST', value: device[1] })
  }
  if (source.originalFilename !== undefined && source.originalFilename !== '') {
    out.push({ key: 'ORIGINALFILENAME', value: source.originalFilename })
  }
  return out
}
