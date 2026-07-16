/**
 * Streaming-friendly SHA-1 of a Blob.
 *
 * Uses WebCrypto `digest` on the full buffer for files up to a memory-safe
 * cap. Ingest size caps (WAV 200MB / FLAC 1GiB) mean a single ArrayBuffer is
 * acceptable for the common case; very large FLACs fall back to a pure-JS
 * incremental SHA-1 that reads the Blob in chunks without ever holding the
 * whole file in memory.
 */

const FULL_BUFFER_MAX_BYTES = 256 * 1024 * 1024 // 256MB: single-buffer path
const CHUNK_BYTES = 8 * 1024 * 1024

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

// ---------------------------------------------------------------------------
// Incremental pure-JS SHA-1 (RFC 3174) for the large-file path.
// ---------------------------------------------------------------------------

class Sha1Incremental {
  private h0 = 0x67452301
  private h1 = 0xefcdab89
  private h2 = 0x98badcfe
  private h3 = 0x10325476
  private h4 = 0xc3d2e1f0
  private readonly buffer = new Uint8Array(64)
  private bufferLength = 0
  private lengthBytes = 0
  private readonly words = new Int32Array(80)

  update (data: Uint8Array): void {
    this.lengthBytes += data.length
    let offset = 0
    if (this.bufferLength > 0) {
      const need = 64 - this.bufferLength
      const take = Math.min(need, data.length)
      this.buffer.set(data.subarray(0, take), this.bufferLength)
      this.bufferLength += take
      offset = take
      if (this.bufferLength === 64) {
        this.processBlock(this.buffer, 0)
        this.bufferLength = 0
      }
    }
    while (offset + 64 <= data.length) {
      this.processBlock(data, offset)
      offset += 64
    }
    if (offset < data.length) {
      this.buffer.set(data.subarray(offset), 0)
      this.bufferLength = data.length - offset
    }
  }

  digestHex (): string {
    const bitLength = this.lengthBytes * 8
    const padded = new Uint8Array(this.bufferLength <= 55 ? 64 : 128)
    padded.set(this.buffer.subarray(0, this.bufferLength))
    padded[this.bufferLength] = 0x80
    const view = new DataView(padded.buffer)
    view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000))
    view.setUint32(padded.length - 4, bitLength >>> 0)
    this.processBlock(padded, 0)
    if (padded.length === 128) this.processBlock(padded, 64)
    return [this.h0, this.h1, this.h2, this.h3, this.h4]
      .map(h => (h >>> 0).toString(16).padStart(8, '0'))
      .join('')
  }

  private processBlock (block: Uint8Array, offset: number): void {
    const w = this.words
    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4
      w[i] =
        (block[j] << 24) |
        (block[j + 1] << 16) |
        (block[j + 2] << 8) |
        block[j + 3]
    }
    for (let i = 16; i < 80; i++) {
      const n = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]
      w[i] = (n << 1) | (n >>> 31)
    }
    let a = this.h0
    let b = this.h1
    let c = this.h2
    let d = this.h3
    let e = this.h4
    for (let i = 0; i < 80; i++) {
      let f: number, k: number
      if (i < 20) {
        f = (b & c) | (~b & d)
        k = 0x5a827999
      } else if (i < 40) {
        f = b ^ c ^ d
        k = 0x6ed9eba1
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d)
        k = 0x8f1bbcdc
      } else {
        f = b ^ c ^ d
        k = 0xca62c1d6
      }
      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) | 0
      e = d
      d = c
      c = (b << 30) | (b >>> 2)
      b = a
      a = temp
    }
    this.h0 = (this.h0 + a) | 0
    this.h1 = (this.h1 + b) | 0
    this.h2 = (this.h2 + c) | 0
    this.h3 = (this.h3 + d) | 0
    this.h4 = (this.h4 + e) | 0
  }
}

/** Compute the sha1 hex digest of a Blob (matches the server's dedup hash). */
export const sha1HexOfBlob = async (blob: Blob): Promise<string> => {
  if (
    blob.size <= FULL_BUFFER_MAX_BYTES &&
    globalThis.crypto?.subtle !== undefined
  ) {
    const digest = await globalThis.crypto.subtle.digest(
      'SHA-1',
      await blob.arrayBuffer()
    )
    return toHex(digest)
  }
  const hasher = new Sha1Incremental()
  for (let offset = 0; offset < blob.size; offset += CHUNK_BYTES) {
    const chunk = await blob
      .slice(offset, Math.min(offset + CHUNK_BYTES, blob.size))
      .arrayBuffer()
    hasher.update(new Uint8Array(chunk))
  }
  return hasher.digestHex()
}
