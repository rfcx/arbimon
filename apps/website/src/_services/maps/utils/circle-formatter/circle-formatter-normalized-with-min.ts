import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '../circle-style/constants'
import { CircleFormatterNormalized, DEFAULT_LEGEND_COUNT, DEFAULT_RADIUS_IN_PIXELS } from './circle-formatter-normalized'
import { CircleLegendEntry } from './types'

export class CircleFormatterNormalizedWithMin extends CircleFormatterNormalized {
  protected readonly showZeroInLegend: boolean

  constructor ({
      maxValueRaw = 1.0,
      maxPixels = DEFAULT_RADIUS_IN_PIXELS,
      legendEntryCount = DEFAULT_LEGEND_COUNT,
      roundFunction = (value: number) => value,
      showZeroInLegend = true
  } = {}) {
    super({ maxValueRaw, maxPixels, legendEntryCount, roundFunction })

    // Store as props
    this.showZeroInLegend = showZeroInLegend
  }

  override getRadius (value: number): number {
    if (value < this.stepValue) return this.stepPixels
    return super.getRadius(value)
  }

  override getLegendEntries (styleNonZero = DEFAULT_NON_ZERO_STYLE, styleZero = DEFAULT_ZERO_STYLE): CircleLegendEntry[] {
    const [head, ...tail] = super.getLegendEntries(styleNonZero, styleZero)

    const zeroEntry = this.showZeroInLegend
      ? [{ label: '0', radiusPx: this.stepPixels, style: styleZero }]
      : []

    return [
      ...zeroEntry,
      { ...head, label: `<= ${head.label}` },
      ...tail
    ]
  }
}
