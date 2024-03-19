import { describe, expect, test } from 'vitest'

import { parseLimitOffset } from './helpers'

describe('limit offset converter test', () => {
  test('successfully convert limit offset string to correct value', () => {
    // Arrange
    const limit = '100'
    const offset = '100'

    // Act
    const parsed = parseLimitOffset(limit, offset, { maxOffset: 1000, defaultLimit: 100 })

    // Assert
    expect(parsed.limit).toEqual(100)
    expect(parsed.offset).toEqual(100)
  })

  test('set limit to given default when given undefined', () => {
    // Arrange
    const limit = undefined
    const offset = '100'

    // Act
    const parsed = parseLimitOffset(limit, offset, { maxOffset: 1000, defaultLimit: 100 })

    // Assert
    expect(parsed.limit).toEqual(100)
    expect(parsed.offset).toEqual(100)
  })

  test('set offset to 0 when given undefined', () => {
    // Arrange
    const limit = '100'
    const offset = undefined

    // Act
    const parsed = parseLimitOffset(limit, offset, { maxOffset: 1000, defaultLimit: 100 })

    // Assert
    expect(parsed.limit).toEqual(100)
    expect(parsed.offset).toEqual(0)
  })

  test('when strings are given, make sure it returns the defaults given value', () => {
    // Arrange
    const limit = 'who'
    const offset = 'who'

    // Act
    const parsed = parseLimitOffset(limit, offset, { maxOffset: 1000, defaultLimit: 100 })

    // Assert
    expect(parsed.limit).toEqual(100)
    expect(parsed.offset).toEqual(0)
  })

  test('when maxOffset is undefined, use the value as is even it\'s so big', () => {
    // Arrange
    const limit = '100'
    const offset = '100000'

    // Act
    const parsed = parseLimitOffset(limit, offset, { maxOffset: undefined, defaultLimit: 100 })

    // Assert
    expect(parsed.limit).toEqual(100)
    expect(parsed.offset).toEqual(100000)
  })
})
