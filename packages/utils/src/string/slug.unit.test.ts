import { expect, test } from 'vitest'

import { isValidSlug } from './slug'

test('isValidSlug', async () => {
  expect(isValidSlug('fire-effects-on-bird-communities')).toBe(true)
  expect(isValidSlug('fire-effects-on-bird-communities-2')).toBe(true)
  expect(isValidSlug('Fire-effects-on-bird-communities')).toBe(false)
  expect(isValidSlug('fire-effects-on-bird-commuNities')).toBe(false)
  expect(isValidSlug('fire--effects-on-bird-communities')).toBe(false)
  expect(isValidSlug('-fire-effects-on-bird-communities')).toBe(false)
})
