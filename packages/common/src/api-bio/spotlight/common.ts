import { DataByTime } from '../common/time-bucket'

export interface SpotlightDetectionDataBySite {
  [siteId: number]: {
    siteId: number
    siteName: string
    latitude: number
    longitude: number
    siteDetectionCount: number
    siteDetectionFrequency: number
    siteOccupied: boolean
  }
}

export interface SpotlightDetectionDataByTime<T extends string | number = number> {
  detection: Record<T, number>
  detectionFrequency: Record<T, number>
}

// ----- Not related to api return item ----
// ? Moving to somewhere
export interface SpotlightExportData {
  hour: SpotlightDetectionDataByTime
  month: SpotlightDetectionDataByTime<string>
  year: SpotlightDetectionDataByTime
  sites: SpotlightDetectionDataBySite
}

// ? Moving to somewhere
export type SpotlightDataByTime = DataByTime<SpotlightDetectionDataByTime>
