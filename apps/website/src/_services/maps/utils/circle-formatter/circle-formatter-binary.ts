import { DEFAULT_NON_ZERO_STYLE, DEFAULT_ZERO_STYLE } from '~/maps/constants'
import { MapBaseFormatter, MapBaseLegendEntry } from '~/maps/types'

const DEFAULT_RADIUS_BINARY_MAX = 6.0
const DEFAULT_RADIUS_BINARY_MIN = 3.0

const DEFAULT_LABEL_NON_ZERO = 'Detected'
const DEFAULT_LABEL_ZERO = 'Not detected'

export class CircleFormatterBinary implements MapBaseFormatter {
  protected readonly maxPixels: number
  protected readonly minPixels: number
  protected readonly labelNonZero: string
  protected readonly labelZero: string

  constructor ({
    maxPixels = DEFAULT_RADIUS_BINARY_MAX,
    minPixels = DEFAULT_RADIUS_BINARY_MIN,
    labelNonZero = DEFAULT_LABEL_NON_ZERO,
    labelZero = DEFAULT_LABEL_ZERO
  } = {}) {
    // Validate params
    if (maxPixels <= 0) throw new Error('maxPixels must be > 0')
    if (minPixels <= 0) throw new Error('minPixels must be > 0')

    // Store as props
    this.maxPixels = maxPixels
    this.minPixels = minPixels
    this.labelNonZero = labelNonZero
    this.labelZero = labelZero
  }

  getRadius (value: number): number {
    return value === 0
      ? this.minPixels
      : this.maxPixels
  }

  getLegendEntries (styleNonZero = DEFAULT_NON_ZERO_STYLE, styleZero = DEFAULT_ZERO_STYLE): MapBaseLegendEntry[] {
    return [
      { label: this.labelZero || DEFAULT_LABEL_ZERO, radiusPx: this.minPixels, style: styleZero },
      { label: this.labelNonZero || DEFAULT_LABEL_NON_ZERO, radiusPx: this.maxPixels, style: styleNonZero }
    ]
  }
}
