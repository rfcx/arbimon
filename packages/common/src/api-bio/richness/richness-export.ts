import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DatasetQueryParams, DatasetQueryParamsSerialized, datasetQueryParamsToString, PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type RichnessExportParams = ProjectRouteParamsSerialized
export type RichnessExportQuery = DatasetQueryParamsSerialized

// Response types
export interface RichnessExportResponse {
  richnessExport: RichnessByExportReportRow[]
}

export interface RichnessByExportReportRow {
  scientificName: string
  commonName?: string
  site: string
  latitude: number
  longitude: number
  altitude: number
  date: string
  year: string
  month: string
  day: string
  hour: string
  countDetectionMinutes: number
}

// Route
export const richnessExportRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/richness-export`

// Service
export const apiBioGetRichnessExport = async (apiClient: AxiosInstance, projectId: number, datasetQuery: DatasetQueryParams): Promise<RichnessExportResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/richness-export?${datasetQueryParamsToString(datasetQuery).toString()}`)
