import { ProjectSpecificRouteParams } from '../_helpers'
import { FilterDatasetQuery } from '../common/filter'
import { DataByTime } from '../common/time-bucket'

// Request
export type SpotlightDatasetParams = ProjectSpecificRouteParams

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

export interface SpotlightDetectionDataBySite {
  [siteId: number]: {
    siteId: number
    siteName: string
    latitude: number
    longitude: number
    siteDetectionCount: number
    siteDetectionFrequency: number
    siteOccupied: boolean
  }
}

export interface SpotlightDetectionDataByTime<T extends string | number = number> {
  detection: Record<T, number>
  detectionFrequency: Record<T, number>
}

// ----- Not related to api return item ----
// ? Moving to somewhere
export interface SpotlightExportData {
  hour: SpotlightDetectionDataByTime
  month: SpotlightDetectionDataByTime<string>
  year: SpotlightDetectionDataByTime
  sites: SpotlightDetectionDataBySite
}

// ? Moving to somewhere
export type SpotlightDataByTime = DataByTime<SpotlightDetectionDataByTime>
