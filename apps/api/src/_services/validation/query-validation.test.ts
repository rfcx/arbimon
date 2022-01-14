// import { request } from 'http'

import { isValidDate } from './query-validation'

// import { spotlightDatasetRoute } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

// describe(`GET ${spotlightDatasetRoute}`, () => {
//   test('Invalid speices', async () => {
//     console.warn = jest.fn()

//     const response = await request()
//   })
// })

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
    expect(date).toBe(false)
  })

  test('Valid date', () => {
    // Arrange
    const validDate = '2021-01-01T00:00:00.000Z'

    // Act
    const date = isValidDate(validDate)

    // Assert
    expect(date).toBe(false)
  })
})
