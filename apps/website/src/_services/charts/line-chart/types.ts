import { ChartMargin } from '../types'

export interface LineChartConfig {
  height: number
  width: number
  margins: ChartMargin
  xTitle: string
  yTitle: string
  xBounds?: [number, number]
  xLabels?: string[]
}

export interface LineChartSeries {
  color: string
  data: Record<number, number>
}
