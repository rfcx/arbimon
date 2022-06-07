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
  name: string
  site: string
  latitude: number
  longitude: number
  day: string
  month: string
  year: string
  date: string
  hour: string
}

// Route
export const richnessExportRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/richness-export`

// Service
export const getRichnessExport = async (apiClient: AxiosInstance, projectId: number, datasetQuery: DatasetQueryParams): Promise<RichnessExportResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/richness-export?${datasetQueryParamsToString(datasetQuery).toString()}`)
