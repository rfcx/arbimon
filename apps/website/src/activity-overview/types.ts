import { ActivityOverviewDataByTime } from '~/api/activity-overview-service'

export interface TimeDataset {
  color: string
  data: ActivityOverviewDataByTime
}
