import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DatasetQueryParams, DatasetQueryParamsSerialized, datasetQueryParamsToString, PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type RichnessDatasetParams = ProjectRouteParamsSerialized
export type RichnessDatasetQuery = DatasetQueryParamsSerialized

// Response types
export interface RichnessDatasetResponse {
  isLocationRedacted: boolean
  richnessByTaxon: Record<number, number> // taxonClassId -> richness
  richnessBySite: RichnessSiteData[]
  richnessByTimeHourOfDay: Record<number, number> // hourOfDay -> richness
  richnessByTimeDayOfWeek: Record<number, number> // dayOfWeek -> richness
  richnessByTimeMonthOfYear: Record<number, number> // monthOfYear -> richness
  richnessByTimeUnix: Record<number, number> // unix -> richness
  richnessPresence: RichnessPresence[]
}

export interface RichnessSiteData {
  locationSiteId: number
  taxonClassId: number
  richness: number
}

export interface RichnessPresence {
  taxonClassId: number
  taxonSpeciesId: number
  taxonSpeciesSlug: string
  commonName: string
  scientificName: string
}

// Route
export const richnessDatasetRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/richness`

// Service
export const apiBioGetRichnessDataset = async (apiClient: AxiosInstance, projectId: number, datasetQuery: DatasetQueryParams): Promise<RichnessDatasetResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/richness?${datasetQueryParamsToString(datasetQuery).toString()}`)
