import { FilterDatasetQuery } from '../common/filter'
import { ActivitySpotlightDataByExport, ActivitySpotlightDataBySite, ActivitySpotlightDataByTime } from './common'

// Request
export interface SpotlightDatasetParams {
  projectId: string
}

export type SpotlightDatasetQuery = FilterDatasetQuery & { speciesId: number }

export const spotlightDatasetRoute = '/projects/:projectId/spotlight'

export const spotlightDatasetUrl = (params: SpotlightDatasetParams): string =>
  `/projects/${params.projectId}/spotlight`

// Response
export interface SpotlightDatasetResponse {
  totalSiteCount: number
  totalRecordingCount: number
  detectionCount: number
  detectionFrequency: number
  occupiedSiteCount: number
  occupiedSiteFrequency: number
  isLocationRedacted: boolean
  activityBySite: ActivitySpotlightDataBySite
  activityByTime: ActivitySpotlightDataByTime
  activityByExport: ActivitySpotlightDataByExport
}
