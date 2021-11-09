import { DatasetDefinition } from '..'

export type TimeBucket = 'hour' | 'day' | 'month' | 'year' | 'quarter'

type ActivityPatternsTimeBucket = Record<TimeBucket, ActivityPatternsDataByTimeBucket>

export interface ActivityPatternsData extends DatasetDefinition {
  totalRecordingCount: number
  totalSiteCount: number
  detectionCount: number
  detectionFrequency: number
  occupiedSiteCount: number
  occupiedSiteFrequency: number
  activityBySite: ActivityPatternsDataBySite
  activityByTime: ActivityPatternsDataByTime
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

// TODO Nutto: Fix type here
export interface ActivityPatternsDataByTime {
  [key in TimeBucket]: ActivityPatternsTimeBucket
}

export interface ActivityPatternsDataByTimeBucket {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
}
