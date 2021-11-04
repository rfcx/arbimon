import { Dayjs } from 'dayjs'

import { Site } from '~/api'

export interface MapDataSet {
  startDate: Dayjs
  endDate: Dayjs
  sites: Site[]
  color: string
  data: MapSiteData[]
  maximumRadius?: number
  dataRange?: { [key: string]: number[] }
}

export interface MapSiteData {
  siteName: string
  longitude: number
  latitude: number
  distinctSpecies: { [key: string]: number | boolean }
  popupTemplate?: string
}
