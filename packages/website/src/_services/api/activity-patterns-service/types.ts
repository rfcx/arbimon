import { DatasetDefinition } from '..'

export interface ActivityPatternsData extends DatasetDefinition {
  totalRecordingCount: number
  totalSiteCount: number
  detectionCount: number
  detectionFrequency: number
  occupiedSiteCount: number
  occupiedSiteFrequency: number
  activityBySite: ActivityPatternsDataBySite
}

export interface ActivityPatternsDataBySite {
  [siteId: string]: {
    siteId: string
    siteName: string
    latitude: number
    longitude: number
    siteDetectionCount: number
    siteDetectionFrequency: number
    siteOccupied: boolean
  }
}
