
export interface BarChartItem {
  category: string
  frequency: number
}

export interface GroupedBarChartItem {
  category: string
  series: BarChartItem[]
}
