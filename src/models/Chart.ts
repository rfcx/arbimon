
export interface ChartSVGElement {
  svg: SVGSVGElement
  width: number
  height: number
}

export interface BarChartItem {
  category: string
  frequency: number
  color: string
}

export interface GroupedBarChartItem {
  group: string
  series: BarChartItem[]
}

export interface MapDataSet {
  color: string
  data: MapSiteData[]
}

export interface MapSiteData {
  siteId: string
  longitude: number
  latitude: number
  distinctSpecies: { [taxonName: string]: number }
}
