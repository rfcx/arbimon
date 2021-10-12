import { Dayjs } from 'dayjs'
import { LngLatLike } from 'mapbox-gl'

import { Site } from './Site'

export interface MapConfig {
  sourceMapId: string
  center: LngLatLike
  zoom: number
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
