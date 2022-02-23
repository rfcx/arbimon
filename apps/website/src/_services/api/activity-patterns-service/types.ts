import { TimeBucket } from '~/time-buckets'

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

export interface ActivityPatternsDataByExport {
  hour: ActivityPatternsDataByExportBucket
  month: ActivityPatternsDataByExportBucket
  year: ActivityPatternsDataByExportBucket
}

export interface ActivityPatternsDataByExportBucket {
  detection: Record<number|string, number>
  detectionFrequency: Record<number|string, number>
}
