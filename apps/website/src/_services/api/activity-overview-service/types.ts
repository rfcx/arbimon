import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

import { TimeBucket } from '~/time-buckets'

export interface DetectionGroupedBySite {
  [siteId: string]: MockHourlyDetectionSummary[]
}

export interface DetectionGroupByDetectionKey {
  [taxonNameOrSiteId: string]: MockHourlyDetectionSummary[]
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

export type ActivityOverviewDataByTime = Record<TimeBucket, ActivityOverviewDataByTimeBucket>

export interface ActivityOverviewDataByTimeBucket {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
}

export const ACTIVITY_OVERVIEW_TIME_KEYS: Record<string, keyof ActivityOverviewDataByTimeBucket> = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency'
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
