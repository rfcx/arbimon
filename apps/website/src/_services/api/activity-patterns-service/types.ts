import { DatasetParameters } from '~/filters'
import { TimeBucket } from '~/time-buckets'

export interface ActivityPatternsData extends DatasetParameters {
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

export type ActivityPatternsDataByTime = Record<TimeBucket, ActivityPatternsDataByTimeBucket>

export interface ActivityPatternsDataByTimeBucket {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
}

export const ACTIVITY_PATTERN_TIME_KEYS: Record<string, keyof ActivityPatternsDataByTimeBucket> = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency'
}
