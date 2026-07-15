import { expect, test } from 'vitest'

import { generateSlug } from './slug'

test('generateSlug produces url-safe base62 of the requested length', () => {
  const slug = generateSlug()
  expect(slug).toMatch(/^[A-Za-z0-9]{10}$/)
  expect(generateSlug(16)).toMatch(/^[A-Za-z0-9]{16}$/)
})

test('generateSlug is (practically) unique across many draws', () => {
  const seen = new Set<string>()
  for (let i = 0; i < 5000; i++) {
    seen.add(generateSlug())
  }
  // 60 bits of entropy → no collisions expected in 5k draws.
  expect(seen.size).toBe(5000)
})
