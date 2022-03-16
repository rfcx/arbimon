import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime } from '../../api-bio/activity/common'

// Request
export interface ActivityDatasetParams {
  projectId: string
}

export const activityDatasetRoute = '/projects/:projectId/activity'

export const activityDatasetGeneratedUrl = (params: ActivityDatasetParams): string => `/projects/${params.projectId}/activity`

// Response
export interface ActivityDatasetResponse {
  isLocationRedacted: boolean
  detectionsBySite: ActivityOverviewDetectionDataBySite
  detectionsBySpecies: ActivityOverviewDataBySpecies[]
  detectionsByTimeHour: ActivityOverviewDetectionDataByTime
  detectionsByTimeDay: ActivityOverviewDetectionDataByTime
  detectionsByTimeMonth: ActivityOverviewDetectionDataByTime
  detectionsByTimeDate: ActivityOverviewDetectionDataByTime
}
