import { LngLatLike } from 'mapbox-gl'

export interface MapConfig {
  sourceMapId: string
  center: LngLatLike
  zoom: number
}

export interface MapDataSet {
  color: string
  data: MapSiteData[]
}

export interface MapSiteData {
  siteName: string
  longitude: number
  latitude: number
  distinctSpecies: { [taxonName: string]: number }
}
