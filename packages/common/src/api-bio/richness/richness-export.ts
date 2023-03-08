import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type DatasetQueryParams, type DatasetQueryParamsSerialized, type ProjectRouteParamsSerialized, datasetQueryParamsToString, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type RichnessExportParams = ProjectRouteParamsSerialized
export type RichnessExportQuery = DatasetQueryParamsSerialized

// Response types
export interface RichnessExportResponse {
  richnessExport: RichnessByExportReportRow[]
}

export interface RichnessByExportReportRow {
  scientific_name: string
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
export const apiBioGetRichnessExport = async (apiClient: AxiosInstance, projectId: number, datasetQuery: DatasetQueryParams): Promise<RichnessExportResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/richness-export?${datasetQueryParamsToString(datasetQuery).toString()}`)
