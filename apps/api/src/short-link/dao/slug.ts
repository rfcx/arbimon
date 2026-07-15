import { randomBytes } from 'node:crypto'

// url-safe, unguessable slug (base62, ~10 chars ≈ 60 bits).
const SLUG_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SLUG_LENGTH = 10

export const generateSlug = (length: number = SLUG_LENGTH): string => {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length]
  }
  return out
}
