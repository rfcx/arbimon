import { MapBaseFormatter, MapBaseLegendEntry } from '~/maps/types'

export class CircleFormatterRawValue implements MapBaseFormatter {
  getRadius (value: number): number {
    return value
  }

  getLegendEntries (): MapBaseLegendEntry[] {
    return []
  }
}
