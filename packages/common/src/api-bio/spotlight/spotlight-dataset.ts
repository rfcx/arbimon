import { FilterDatasetQuery } from '../common/filter'
import { ActivitySpotlightDataByExport, ActivitySpotlightDataBySite, ActivitySpotlightDataByTime } from './common'

// Request
export interface spotlightDatasetParams {
  projectId: string
}

export type SpotlightDatasetQuery = FilterDatasetQuery & { speciesId: string }

export const spotlightDatasetRoute = '/projects/:projectId/spotlight'

export const spotlightDatasetUrl = (params: spotlightDatasetParams): string =>
  `/projects/${params.projectId}/spotlight`

// Response
export interface SpotlightDatasetResponse {
  totalSiteCount: number
  totalRecordingCount: number
  detectionCount: number
  detectionFrequency: number
  occupiedSiteCount: number
  occupiedSiteFrequency: number
  activityBySite: ActivitySpotlightDataBySite
  activityByTime: ActivitySpotlightDataByTime
  activityByExport: ActivitySpotlightDataByExport
}
