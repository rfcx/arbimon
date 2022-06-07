import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DataByTime, DatasetQueryParams, DatasetQueryParamsSerialized, datasetQueryParamsToString, PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type SpotlightDatasetParams = ProjectRouteParamsSerialized
export type SpotlightDatasetQuery = DatasetQueryParamsSerialized & { speciesId: string }

// Response types
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

// Route
export const spotlightDatasetRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/spotlight`

// Service
export const getSpotlightDataset = async (apiClient: AxiosInstance, projectId: number, speciesId: number, datasetQuery: DatasetQueryParams): Promise<SpotlightDatasetResponse | undefined> => {
  const query = datasetQueryParamsToString(datasetQuery)
  query.append('speciesId', speciesId.toString())

  const url = `/projects/${projectId}/spotlight?${query.toString()}`
  return await apiGetOrUndefined(apiClient, url)
}
