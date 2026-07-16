import { webcrypto } from 'node:crypto'
import { describe, expect, test } from 'vitest'

import { sha1HexOfBlob } from './sha1'

describe('sha1HexOfBlob', () => {
  test('known vector: empty', async () => {
    expect(await sha1HexOfBlob(new Blob([]))).toBe(
      'da39a3ee5e6b4b0d3255bfef95601890afd80709'
    )
  })

  test('known vector: abc', async () => {
    expect(await sha1HexOfBlob(new Blob(['abc']))).toBe(
      'a9993e364706816aba3e25717850c26c9cd0d89d'
    )
  })

  test('known vector: long input crossing block boundaries', async () => {
    const input = 'a'.repeat(1_000_000)
    expect(await sha1HexOfBlob(new Blob([input]))).toBe(
      '34aa973cd4c4daa4f61eeb2bdbad27316534016f'
    )
  })

  test('matches WebCrypto reference on multi-block payload', async () => {
    // Deterministic 3MB payload; compare sha1HexOfBlob against WebCrypto.
    const bytes = new Uint8Array(3 * 1024 * 1024)
    for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 31 + 7) & 0xff
    const viaEngine = await sha1HexOfBlob(new Blob([bytes]))
    const digest = await webcrypto.subtle.digest('SHA-1', bytes)
    const expected = Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    expect(viaEngine).toBe(expected)
  })
})
