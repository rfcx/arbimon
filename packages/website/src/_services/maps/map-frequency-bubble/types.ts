import { Dayjs } from 'dayjs'

import { Site } from '~/api'

export interface MapFrequencyDataset {
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
  distinctSpecies: unknown
}
