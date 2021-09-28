
export interface ChartSVGElement {
  svg: SVGSVGElement
  width: number
  height: number
}

export interface BarChartItem {
  category: string
  frequency: number
  color?: string
}

export interface GroupedBarChartItem {
  category: string
  series: BarChartItem[]
}
