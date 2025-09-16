import numeral from 'numeral'

import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '~/maps/constants'
import { type MapBaseFormatter, type MapBaseLegendEntry } from '~/maps/types'

export const DEFAULT_MAX_VALUE_RAW = 1.0
export const DEFAULT_LEGEND_COUNT = 4
export const DEFAULT_RADIUS_IN_PIXELS = 10.0
export const DEFAULT_FORMAT_FUNCTION = (value: number, isIntegerLabel: boolean): string => mapLegendLabelFormatted(value, isIntegerLabel)

const isFloat = (num: number): boolean => {
  return !isNaN(num) && num % 1 !== 0
}
const mapLegendLabelFormatted = (value: number, isIntegerLabel: boolean): string => {
  if (value > 999 && !isFloat(value)) return numeral(value).format('0,00')
  return isIntegerLabel ? Math.ceil(value).toPrecision(3) : value.toPrecision(3)
}

export class CircleFormatterNormalized implements MapBaseFormatter {
  protected readonly stepValue: number
  protected readonly stepPixels: number
  protected readonly maxValue: number
  protected readonly maxPixels: number
  protected readonly legendEntryCount: number
  protected readonly formatFunction: (value: number, isIntegerLabel: boolean) => string

  constructor ({
    maxValueRaw = DEFAULT_MAX_VALUE_RAW,
    maxPixels = DEFAULT_RADIUS_IN_PIXELS,
    legendEntryCount = DEFAULT_LEGEND_COUNT,
    formatFunction = DEFAULT_FORMAT_FUNCTION
  } = {}) {
    // Validate params
    if (maxValueRaw < 0) throw new Error('maxPixels must be >= 0')
    if (maxPixels <= 0) throw new Error('maxPixels must be > 0')
    if (legendEntryCount < 1) throw new Error('stepCount must be >= 1')
    if (legendEntryCount % 1 !== 0) throw new Error('stepCount must be integer')

    // Store as props
    this.maxPixels = maxPixels
    this.legendEntryCount = (!isFloat(maxValueRaw) && legendEntryCount > maxValueRaw) ? maxValueRaw : DEFAULT_LEGEND_COUNT
    this.formatFunction = formatFunction

    // Calc pixels per step
    this.stepPixels = maxPixels / this.legendEntryCount

    // Round step value
    const stepValueRaw = (maxValueRaw || 1.0) / this.legendEntryCount
    this.stepValue = Number(formatFunction(stepValueRaw, false))

    // Calculate max from rounded step
    this.maxValue = this.stepValue * this.legendEntryCount
  }

  getRadius (value: number): number {
    return (value / this.maxValue) * this.maxPixels
  }

  getLegendEntries (styleNonZero = DEFAULT_NON_ZERO_STYLE, styleZero = DEFAULT_ZERO_STYLE, isIntegerLabel = false): MapBaseLegendEntry[] {
    return Array.from({ length: this.legendEntryCount }, (_, idx) => ({
        label: this.formatFunction(this.stepValue * (idx + 1), isIntegerLabel),
        radiusPx: this.stepPixels * (idx + 1),
        style: styleNonZero
      }))
  }
}
