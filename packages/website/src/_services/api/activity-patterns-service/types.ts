import { DatasetDefinition } from '..'

export type TimeBucket = 'hour' | 'day' | 'month' | 'year' | 'quarter'

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

export interface ActivityPatternsDataByTime {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
  occupancy: Record<number, number>
}
