import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '~/maps/constants'
import { type MapBaseLegendEntry } from '~/maps/types'
import { CircleFormatterNormalized, DEFAULT_FORMAT_FUNCTION, DEFAULT_LEGEND_COUNT, DEFAULT_RADIUS_IN_PIXELS } from './circle-formatter-normalized'

export const DEFAULT_SHOW_IN_LEGEND = true
export const DEFAULT_LABEL_ZERO = '0'

export class CircleFormatterNormalizedWithMin extends CircleFormatterNormalized {
  protected readonly showZeroInLegend: boolean
  protected readonly labelZero: string

  constructor ({
      maxValueRaw = 1.0,
      maxPixels = DEFAULT_RADIUS_IN_PIXELS,
      legendEntryCount = DEFAULT_LEGEND_COUNT,
      formatFunction = DEFAULT_FORMAT_FUNCTION,
      showZeroInLegend = DEFAULT_SHOW_IN_LEGEND,
      labelZero = DEFAULT_LABEL_ZERO
  } = {}) {
    super({ maxValueRaw, maxPixels, legendEntryCount, formatFunction })

    // Store as props
    this.showZeroInLegend = showZeroInLegend
    this.labelZero = labelZero
  }

  override getRadius (value: number): number {
    if (value < this.stepValue) return this.stepPixels
    return super.getRadius(value)
  }

  override getLegendEntries (styleNonZero = DEFAULT_NON_ZERO_STYLE, styleZero = DEFAULT_ZERO_STYLE): MapBaseLegendEntry[] {
    const [head, ...tail] = super.getLegendEntries(styleNonZero, styleZero)

    const zeroEntry = this.showZeroInLegend
      ? [{ label: this.labelZero, radiusPx: this.stepPixels, style: styleZero }]
      : []

    return [
      ...zeroEntry,
      { ...head, label: `≤ ${head.label}` },
      ...tail
    ]
  }
}
