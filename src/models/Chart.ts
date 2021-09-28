
export interface BarChartItem {
  category: string
  frequency: number
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
