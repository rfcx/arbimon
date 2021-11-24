import { getLegendEntries } from './index'

describe('getLegendEntries', () => {
  test('Returns requested number of legend entries', () => {
    const legendSizes = getLegendEntries(10.0, 100, 5)
    expect(legendSizes.length).toBe(5)
  })

  test('Returns empty array if maxValue is zero', () => {
    const legendSizes = getLegendEntries(10.0, 0, 5)
    expect(legendSizes.length).toBe(0)
  })

  test('Largest legend entry is greater or equal to input values', () => {
    // Arrange
    const maxPixels = 100
    const inputMaxValues = [0.1398, 1, 1.7, 5, 10, 37.1415, 123.123, 1923]

    // Act
    const results = inputMaxValues.map(inputMaxValue => getLegendEntries(maxPixels, inputMaxValue, 5))

    // Assert
    results.forEach((result, i) => {
      const { value: actualMaxValue, pixels: actualMaxPixels } = result[result.length - 1]
      expect(actualMaxValue).toBeGreaterThanOrEqual(inputMaxValues[i])
      expect(actualMaxPixels).toBeGreaterThanOrEqual(maxPixels)
    })
  })
})
