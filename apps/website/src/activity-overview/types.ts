import { type TimeBucket } from '~/time-buckets'

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
  detectionMinutesCount: number
  detectionFrequency: number
  occupiedSites: number
  occupancyNaive: number
}
