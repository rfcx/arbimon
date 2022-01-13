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
    const invalid = undefined

    // Act
    const date = isValidDate(invalid)

    // Assert
    expect(date).toBe(false)
  })
})
