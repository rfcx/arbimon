import { CircleStyle } from '../circle-style/types'

export interface CircleLegendEntry {
  label: string
  radiusPx: number
  style: CircleStyle
}

export interface CircleFormatter {
  getRadius: (value: number) => number
  getLegendEntries: (styleNonZero: CircleStyle, styleZero: CircleStyle) => CircleLegendEntry[]
}
