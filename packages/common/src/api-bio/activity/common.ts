import { MockHourlyDetectionSummary } from 'mock-data'

export interface DetectionGroupedBySite {
  [siteId: string]: MockHourlyDetectionSummary[]
}

export interface ActivityOverviewDataBySite {
  [siteId: string]: {
    siteId: string
    siteName: string
    latitude: number
    longitude: number
    detection: number
    detectionFrequency: number
    occupancy: boolean
  }
}
