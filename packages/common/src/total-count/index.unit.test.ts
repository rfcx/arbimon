import { describe, expect, test } from 'vitest'

import { formatTotalCount } from './index'

describe('toNumber function', () => {
  test.each([
    ['', 0],
    [null, 0],
    [undefined, 0],
    [NaN, 0],
    ['who', 0],
    [9, 9],
    ['18', 18]
  ])('toNumber(%s) => %i', (value, expected) => {
    expect(formatTotalCount(value)).toEqual(expected)
  })
})
