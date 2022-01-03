import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '../circle-style/constants'
import { CircleFormatter, CircleLegendEntry } from './types'

export const DEFAULT_LEGEND_COUNT = 4
export const DEFAULT_RADIUS_IN_PIXELS = 10.0

export class CircleFormatterNumeric implements CircleFormatter {
  protected readonly stepValue: number
  protected readonly stepPixels: number
  protected readonly maxValue: number
  protected readonly maxPixels: number
  protected readonly legendEntryCount: number
  protected readonly roundFunction: (value: number) => number

  constructor ({
    maxValueRaw = 1.0,
    maxPixels = DEFAULT_RADIUS_IN_PIXELS,
    legendEntryCount = DEFAULT_LEGEND_COUNT,
    roundFunction = (value: number) => value
  } = {}) {
    // Validate params
    if (maxValueRaw < 0) throw new Error('maxPixels must be >= 0')
    if (maxPixels <= 0) throw new Error('maxPixels must be > 0')
    if (legendEntryCount < 1) throw new Error('stepCount must be >= 1')
    if (legendEntryCount % 1 !== 0) throw new Error('stepCount must be integer')

    // Store as props
    this.maxPixels = maxPixels
    this.legendEntryCount = legendEntryCount
    this.roundFunction = roundFunction

    // Calc pixels per step
    this.stepPixels = this.maxPixels / this.legendEntryCount

    // Round step value
    const stepValueRaw = (maxValueRaw || 1.0) / this.legendEntryCount
    this.stepValue = this.roundFunction(stepValueRaw)

    // Calculate max from rounded step
    this.maxValue = this.stepValue * this.legendEntryCount
  }

  getRadius (value: number): number {
    return value / this.maxValue * this.maxPixels
  }

  getLegendEntries (styleNonZero = DEFAULT_NON_ZERO_STYLE, styleZero = DEFAULT_ZERO_STYLE): CircleLegendEntry[] {
    return Array.from({ length: this.legendEntryCount }, (_, idx) => ({
        label: `${this.stepValue * (idx + 1)}`,
        radiusPx: this.stepPixels * (idx + 1),
        style: styleNonZero
      }))
  }
}
