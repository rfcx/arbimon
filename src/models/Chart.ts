import { Dayjs } from 'dayjs'

import { Site } from './Site'

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
  startDate: Dayjs
  endDate: Dayjs
  sites: Site[]
  color: string
  data: MapSiteData[]
}

export interface MapSiteData {
  siteName: string
  longitude: number
  latitude: number
  distinctSpecies: { [taxonName: string]: number }
}

export interface TableData {
  speciesName: string
  className: string
  data: boolean[]
  total: number
}
