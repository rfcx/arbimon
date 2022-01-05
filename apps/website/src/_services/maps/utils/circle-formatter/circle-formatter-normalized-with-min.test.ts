import { describe, expect, test } from 'vitest'

import { CircleFormatterNormalizedWithMin } from '~/maps/utils/circle-formatter/circle-formatter-normalized-with-min'

const NULL_FORMAT_FUNCTION = (v: number): string => v.toString()

describe('contract', () => {
  test('should not throw with default params', () => {
    expect(() => new CircleFormatterNormalizedWithMin()).not.toThrow()
  })
})

describe('radius calculation', () => {
  test('radius should be minimum (> 0) if value 0', () => {
    // Arrange
    const formatter = new CircleFormatterNormalizedWithMin({ formatFunction: NULL_FORMAT_FUNCTION })

    // Act
    const radius = formatter.getRadius(0)

    // Assert
    expect(radius).toBeGreaterThan(0)
  })
})

describe('legend', () => {
  test('legend includes "≤" for min entry', () => {
    // Arrange
    const formatter = new CircleFormatterNormalizedWithMin()

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    expect(entries.find(entry => entry.label.includes('≤'))).toBeDefined()
  })

  test('legend should not include "zero" entry if not requested', () => {
    // Arrange
    const labelZero = 'RIDICULOUS_LABEL'
    const formatter = new CircleFormatterNormalizedWithMin({ showZeroInLegend: false, labelZero })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    expect(entries.find(entry => entry.label === labelZero)).toBeUndefined()
  })

  test('legend should include "zero" entry if requested', () => {
    // Arrange
    const labelZero = 'RIDICULOUS_LABEL'
    const formatter = new CircleFormatterNormalizedWithMin({ showZeroInLegend: true, labelZero })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    expect(entries.find(entry => entry.label === labelZero)).toBeDefined()
  })

  test('entries has "zero" entry first', () => {
    // Arrange
    const labelZero = 'RIDICULOUS_LABEL'
    const formatter = new CircleFormatterNormalizedWithMin({ showZeroInLegend: true, labelZero })

    // Act
    const entries = formatter.getLegendEntries()

    // Assert
    expect(entries[0].label).toBe(labelZero)
  })

  test('entries should add "zero" on top of legendEntryCount', () => {
    // Arrange
    const formatterNoZero = new CircleFormatterNormalizedWithMin({ showZeroInLegend: false })
    const formatterWithZero = new CircleFormatterNormalizedWithMin({ showZeroInLegend: true })

    // Act
    const entriesNoZero = formatterNoZero.getLegendEntries()
    const entriesWithZero = formatterWithZero.getLegendEntries()

    // Assert
    expect(entriesWithZero.length).toBe(entriesNoZero.length + 1)
  })
})
