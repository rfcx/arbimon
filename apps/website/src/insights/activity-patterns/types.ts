import { type TimeBucket } from '~/time-buckets'

export type ActivityPatternsDataByTime = Record<TimeBucket, ActivityPatternsDataByTimeBucket>

export interface ActivityPatternsDataByTimeBucket {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
}

export const ACTIVITY_PATTERN_TIME_KEYS: Record<string, keyof ActivityPatternsDataByTimeBucket> = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency'
}

export interface MetricsDataset {
  value: string
  description: string
  color?: string
}

export interface Metrics {
  title: string
  information: string
  datasets: MetricsDataset[]
}

export interface TimeDataset {
  color: string
  data: ActivityPatternsDataByTime
}
