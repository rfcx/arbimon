import { ActivityPatternsDataByTime } from '~/api/activity-patterns-service'

export interface MetricsDataset {
  value: number
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
