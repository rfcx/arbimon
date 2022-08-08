import { describe, expect, test } from 'vitest'

import { isValidDate } from './query-validation'

describe('ISO date format', () => {
  test('Empty date', () => {
    // Arrange
    const invalidDate = undefined

    // Act
    const date = isValidDate(invalidDate)

    // Assert
    expect(date).toBe(false)
  })

  test('Invalid string', () => {
    // Arrange
    const invalidDate = 'abcd'

    // Act
    const date = isValidDate(invalidDate)

    // Assert
    expect(date).toBeFalsy()
  })

  test('Valid ISO format date', () => {
    // Arrange
    const validDate = '2021-01-01T00:00:00.000Z'

    // Act
    const date = isValidDate(validDate)

    // Assert
    expect(date).toBeTruthy()
  })

  test('Valid YYYY-MM-DD format date', () => {
    // Arrange
    const validDate = '2021-01-01'

    // Act
    const date = isValidDate(validDate)

    // Assert
    expect(date).toBeTruthy()
  })
})
