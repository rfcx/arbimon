import { type ChartMargin } from '../types'

export interface BarChartItem {
  category: string
  frequency: number
  color: string
}

export interface GroupedBarChartItem {
  group: string
  series: BarChartItem[]
}

export interface BarChartConfig {
  width: number
  margins: ChartMargin
  xTitle: string
  displayXAxisTick: boolean
  fontColor: string
}
