import { describe, expect, test } from 'vitest'

import { CircleFormatterBinary } from '~/maps/utils/circle-formatter/circle-formatter-binary'

describe('contract', () => {
  test('should throw if maxPixels <= 0', () => {
    expect(() => new CircleFormatterBinary({ maxPixels: 0 })).toThrow()
    expect(() => new CircleFormatterBinary({ maxPixels: -0.1 })).toThrow()
    expect(() => new CircleFormatterBinary({ maxPixels: -10.0 })).toThrow()
  })

  test('should throw if minPixels <= 0', () => {
    expect(() => new CircleFormatterBinary({ minPixels: 0 })).toThrow()
    expect(() => new CircleFormatterBinary({ minPixels: -0.1 })).toThrow()
    expect(() => new CircleFormatterBinary({ minPixels: -10.0 })).toThrow()
  })

  test('should not throw with default params', () => {
    expect(() => new CircleFormatterBinary()).not.toThrow()
  })
})

describe('radius calculation', () => {
  test('radius should be minPixels if value 0', () => {
    // Arrange
    const minPixels = 123.45
    const formatter = new CircleFormatterBinary({ minPixels })

    // Act
    const radius = formatter.getRadius(0)

    // Assert
    expect(radius).toBe(minPixels)
  })
  test('radius should be maxPixels if value 1', () => {
    // Arrange
    const maxPixels = 67.89
    const formatter = new CircleFormatterBinary({ maxPixels })

    // Act
    const radius = formatter.getRadius(1)

    // Assert
    expect(radius).toBe(maxPixels)
  })

  test('radius should be maxPixels if value !== 0', () => {
   // Arrange
   const maxPixels = 67.89
   const formatter = new CircleFormatterBinary({ maxPixels })

   // Act
   const radius1 = formatter.getRadius(0.35)
   const radius2 = formatter.getRadius(37.1)
   const radius3 = formatter.getRadius(-24.9)

   // Assert
   expect(radius1).toBe(maxPixels)
   expect(radius2).toBe(maxPixels)
   expect(radius3).toBe(maxPixels)
  })
})

describe('legend', () => {
  test('legend should have 2 entries', () => {
    // Arrange
    const formatter = new CircleFormatterBinary()

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    expect(entries).toHaveLength(2)
  })

  test('legend entry values should given min and max', () => {
    // Arrange
    const maxPixels = 7.5
    const minPixels = 0.5
    const formatter = new CircleFormatterBinary({ maxPixels, minPixels })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    expect(entries.find(entry => entry.radiusPx === maxPixels)).toBeDefined()
    expect(entries.find(entry => entry.radiusPx === minPixels)).toBeDefined()
  })

  test('legend is sorted smallest to largest', () => {
    // Arrange
    const formatter = new CircleFormatterBinary()

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].radiusPx).toBeLessThan(entries[i].radiusPx)
    }
  })
})
