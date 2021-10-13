export interface LineChartConfig {
  height: number
  width: number
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  xBounds?: [number, number]
}

export interface LineChartSeries {
  color: string
  data: Record<number, number>
}
