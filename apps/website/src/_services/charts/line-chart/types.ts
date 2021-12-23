export interface LineChartConfig {
  height: number
  width: number
  margins: Margin
  xTitle: string
  yTitle: string
  xBounds?: [number, number]
  xLabels?: string[]
}

export interface LineChartSeries {
  color: string
  data: Record<number, number>
}

export interface Margin {
  top: number
  bottom: number
  left: number
  right: number
}
