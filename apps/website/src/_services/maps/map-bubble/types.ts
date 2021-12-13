import { Dayjs } from 'dayjs'
import { LngLatLike } from 'mapbox-gl'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'

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
  maxValues: { [key: string]: number }
  title?: string
}

export interface MapSiteData {
  siteName: string
  longitude: number
  latitude: number
  // TODO 266 - Decouple maps
  distinctSpecies: { [key: string]: number | boolean }
}
