import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DataByTime, DatasetQueryParams, DatasetQueryParamsSerialized, datasetQueryParamsToString, PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type ActivityDatasetParams = ProjectRouteParamsSerialized
export type ActivityDatasetQuery = DatasetQueryParamsSerialized

// Response types
export interface ActivityDatasetResponse {
  isLocationRedacted: boolean
  activityBySite: ActivityOverviewDetectionDataBySite[]
  activityBySpecies: ActivityOverviewDataBySpecies[]
  activityByTimeHour: ActivityOverviewDetectionDataByTime
  activityByTimeDay: ActivityOverviewDetectionDataByTime
  activityByTimeMonth: ActivityOverviewDetectionDataByTime
  activityByTimeDate: ActivityOverviewDetectionDataByTime
}

export interface ActivityOverviewDetectionDataBySite {
  siteId: number
  siteName: string
  latitude: number
  longitude: number
  totalDetectionCount: number
  totalDetectionMinutes: number
  detectionFrequency: number
  occupancy: boolean
}

export interface ActivityOverviewRecordingDataBySite {
  siteId: number
  siteName: string
  totalRecordingMinutes: number
}

export interface ActivityOverviewDetectionDataByTime {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
}

export interface ActivityOverviewDataBySpecies {
  scientificName: string
  commonName: string
  taxon: string
  detectionCount: number
  detectionFrequency: number
  occupiedSites: number
  occupancyNaive: number
}

// ----- Not related to api return item ----
// ? Moving to somewhere
export type ActivityOverviewDataByTime = DataByTime<ActivityOverviewDetectionDataByTime>

// Route
export const activityDatasetRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/activity`

// Service
export const apiBioGetActivityDataset = async (apiClient: AxiosInstance, projectId: number, datasetQuery: DatasetQueryParams): Promise<ActivityDatasetResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/activity?${datasetQueryParamsToString(datasetQuery).toString()}`)
