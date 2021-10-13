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
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  fontColor: string
}
