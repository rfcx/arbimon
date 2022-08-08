import { describe, expect, test } from 'vitest'

import { isValidQueryHours } from './index'

describe('isValidQueryHours', () => {
  describe('happy path', () => {
    test('query hours with 1 digit format (midnight)', async () => {
      // Arrange
      const queryHour = '0'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })

    test('query hours with 2 digit format (midnight)', async () => {
      // Arrange
      const queryHour = '00'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })

    test('query hours with 1 digit format (daytime)', async () => {
      // Arrange
      const queryHour = '9'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })

    test('query hours with 2 digit format (daytime)', async () => {
      // Arrange
      const queryHour = '09'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })

    test('query hours with 1 digit comma', async () => {
      // Arrange
      const queryHour = '1,2'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })

    test('query hours with 2 digit comma', async () => {
      // Arrange
      const queryHour = '01,02'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })

    test('query hours with 1 digit format and hyphen', async () => {
      // Arrange
      const queryHour = '1-9'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })

    test('query hours with 2 digit format and hyphen', async () => {
      // Arrange
      const queryHour = '01-09'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })

    test('query hours with comma and hyphen', async () => {
      // Arrange
      const queryHour = '01,02,20-23'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeTruthy()
    })
  })

  describe('invalid path', () => {
    test('query hours with invalid time of day', async () => {
      // Arrange
      const queryHour = '27,28'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeFalsy()
    })

    test('query hours with invalid time of day (negative)', async () => {
      // Arrange
      const queryHour = '-1'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeFalsy()
    })

    test('query hours with invalid time of day (ending with comma)', async () => {
      // Arrange
      const queryHour = '4-6,8,'

      // Act
      const actual = isValidQueryHours(queryHour)

      // Assert
      expect(actual).toBeFalsy()
    })
  })
})
