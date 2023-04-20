import { describe, expect, test } from 'vitest'

import { truncateEllipsis } from './index'

describe('truncateEllipsis', () => {
  test('within max length', () => {
    // Act
    const actual = truncateEllipsis('Hello there', 11)

    // Assert
    expect(actual).toEqual('Hello there')
  })

  test('over max length', () => {
    // Act
    const actual = truncateEllipsis('Hello there', 10)

    // Assert
    expect(actual).toEqual('Hello the…')
  })
})
