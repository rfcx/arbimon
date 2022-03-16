import { DataByTime } from '../common/time-bucket'

export interface ActivityOverviewDetectionDataBySite {
  [siteId: number]: {
    siteId: number
    siteName: string
    latitude: number
    longitude: number
    detection: number
    detectionFrequency: number
    occupancy: boolean
  }
}

export interface ActivityOverviewDetectionDataByTime {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
}

export interface ActivityOverviewDataBySpecies {
  scientificName: string
  commonName: string
  taxon: string
  detectionCount: number
  detectionFrequency: number
  occupiedSites: number
  occupancyNaive: number
}

// ----- Not related to api return item ----
// ? Moving to somewhere
export type ActivityOverviewDataByTime = DataByTime<ActivityOverviewDetectionDataByTime>
