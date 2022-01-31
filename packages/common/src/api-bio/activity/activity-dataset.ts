import { ActivityOverviewDataBySite, ActivityOverviewDataBySpecies, ActivityOverviewDataByTime } from '../../api-bio/activity/common'
import { Site } from '../common/sites'

// Request
export interface ActivityDatasetParams {
  projectId: string
}

export const activityDatasetRoute = '/projects/:projectId/activity'

export const activityDatasetGeneratedUrl = (params: ActivityDatasetParams): string => `/projects/${params.projectId}/activity`

// Response
export interface ActivityDatasetResponse {
  isLocationRedacted: boolean
  overviewBySite: ActivityOverviewDataBySite
  overviewByTime: ActivityOverviewDataByTime
  overviewBySpecies: ActivityOverviewDataBySpecies[]
  sites: Site[]
}
