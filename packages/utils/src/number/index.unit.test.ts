import { describe, expect, test } from 'vitest'

import { firstDiffDigit } from './index'

describe('firstDiffDigit', () => {
  test('Can find a different first digit', () => {
    // Arrange
    const numNew = 123
    const numOld = 456
    const expected = 1

    // Act
    const actual = firstDiffDigit(numNew, numOld)

    // Assert
    expect(actual).toEqual(expected)
  })

  test('Can find a different middle digit', () => {
    // Arrange
    const numNew = 156
    const numOld = 198
    const expected = 5

    // Act
    const actual = firstDiffDigit(numNew, numOld)

    // Assert
    expect(actual).toEqual(expected)
  })

  test('Can find a different last digit', () => {
    // Arrange
    const numNew = 123
    const numOld = 126
    const expected = 3

    // Act
    const actual = firstDiffDigit(numNew, numOld)

    // Assert
    expect(actual).toEqual(expected)
  })
})
