import { CircleFormatter, CircleLegendEntry } from './types'

export class CircleFormatterRawValue implements CircleFormatter {
  getRadius (value: number): number {
    return value
  }

  getLegendEntries (): CircleLegendEntry[] {
    return []
  }
}
