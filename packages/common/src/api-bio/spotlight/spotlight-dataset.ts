import { FilterDatasetQuery } from '../common/filter'
import { SpotlightDetectionDataBySite, SpotlightDetectionDataByTime } from './common'

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
  isLocationRedacted: boolean
  totalSiteCount: number
  totalRecordingCount: number
  detectionCount: number
  detectionFrequency: number
  occupiedSiteCount: number
  occupiedSiteFrequency: number
  detectionsByLocationSite: SpotlightDetectionDataBySite
  detectionsByTimeHour: SpotlightDetectionDataByTime
  detectionsByTimeDay: SpotlightDetectionDataByTime
  detectionsByTimeMonth: SpotlightDetectionDataByTime
  detectionsByTimeYear: SpotlightDetectionDataByTime
  detectionsByTimeDate: SpotlightDetectionDataByTime
  detectionsByTimeMonthYear: SpotlightDetectionDataByTime
}
