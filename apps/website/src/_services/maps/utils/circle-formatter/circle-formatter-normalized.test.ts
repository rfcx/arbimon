import { describe, expect, test } from 'vitest'

import { CircleFormatterNumeric } from '~/maps/utils/circle-formatter/circle-formatter-normalized'

const NULL_ROUND_FUNCTION = (v: number): number => v

describe('contract', () => {
  test('should throw if maxValueRaw < 0', () => {
    expect(() => new CircleFormatterNumeric({ maxValueRaw: -0.1 })).toThrow()
    expect(() => new CircleFormatterNumeric({ maxValueRaw: -10.0 })).toThrow()
  })

  test('should throw if maxPixels <= 0', () => {
    expect(() => new CircleFormatterNumeric({ maxPixels: 0 })).toThrow()
    expect(() => new CircleFormatterNumeric({ maxPixels: -0.1 })).toThrow()
    expect(() => new CircleFormatterNumeric({ maxPixels: -10.0 })).toThrow()
  })

  test('should throw if legendEntryCount < 1', () => {
    expect(() => new CircleFormatterNumeric({ legendEntryCount: 0 })).toThrow()
    expect(() => new CircleFormatterNumeric({ legendEntryCount: -1 })).toThrow()
    expect(() => new CircleFormatterNumeric({ legendEntryCount: -2 })).toThrow()
  })

  test('should throw if legendEntryCount is non-integer', () => {
    expect(() => new CircleFormatterNumeric({ legendEntryCount: 0.5 })).toThrow()
    expect(() => new CircleFormatterNumeric({ legendEntryCount: 10.5 })).toThrow()
  })

  test('should not throw with default params', () => {
    expect(() => new CircleFormatterNumeric()).not.toThrow()
  })
})

describe('radius calculation', () => {
  test('radius should be 0 if value 0', () => {
    // Arrange
    const formatter = new CircleFormatterNumeric({ roundFunction: NULL_ROUND_FUNCTION })

    // Act
    const radius = formatter.getRadius(0)

    // Assert
    expect(radius).toBe(0)
  })

  test('radius should scale proportionally to value', () => {
    // Arrange
    const maxValue = 123.45
    const formatter = new CircleFormatterNumeric({ roundFunction: NULL_ROUND_FUNCTION })

    // Act
    const radius1 = formatter.getRadius(1.0)
    const radius2 = formatter.getRadius(2.0)
    const radiusHalfMax = formatter.getRadius(maxValue / 2.0)
    const radiusMax = formatter.getRadius(maxValue)

    // Assert
    expect(radius2).toBe(radius1 * 2.0)
    expect(radiusMax).toBe(radiusHalfMax * 2.0)
  })
})

describe('legend', () => {
  test('legend length matches legendEntryCount', () => {
    // Arrange
    const legendEntryCount = 10
    const formatter = new CircleFormatterNumeric({ roundFunction: NULL_ROUND_FUNCTION, legendEntryCount })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    expect(entries.length).toBe(legendEntryCount)
  })

  test('legend entries should be positive', () => {
    // Arrange
    const formatter = new CircleFormatterNumeric({ roundFunction: NULL_ROUND_FUNCTION })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    entries.forEach(entry => {
      expect(Number(entry.label)).toBeGreaterThan(0)
    })
  })

  test('legend is sorted smallest to largest', () => {
    // Arrange
    const formatter = new CircleFormatterNumeric({ roundFunction: NULL_ROUND_FUNCTION })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].radiusPx).toBeLessThan(entries[i].radiusPx)
    }
  })

  test('legend is equally spaced', () => {
    // Arrange
    const formatter = new CircleFormatterNumeric({ roundFunction: NULL_ROUND_FUNCTION })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    for (let i = 2; i < entries.length; i++) {
      expect(entries[i - 1].radiusPx - entries[i - 2].radiusPx).toBe(entries[i].radiusPx - entries[i - 1].radiusPx)
    }
  })

  test('legend values should be rounded', () => {
    // Arrange
    const roundFunction = Math.round
    const formatter = new CircleFormatterNumeric({ roundFunction })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    entries.forEach(entry => {
      const value = Number(entry.label) ?? 0
      expect(value).toEqual(roundFunction(value))
    })
  })
})
