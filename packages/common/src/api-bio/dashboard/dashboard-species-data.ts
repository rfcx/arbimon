import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ApiStack, type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type DashboardSpecies, type HighlightedSpecies } from './common'

// Request types
export type DashboardSpeciesDataParams = ProjectRouteParamsSerialized

export interface SpeciesHighlightedBody {
  species: HighlightedSpecies[]
}

// Response types
export interface DashboardSpeciesDataResponse {
  // TODO: include this (all species in project) species: DashboardSpecies[]
  richnessByTaxon: ApiStack
  richnessByRisk: ApiStack
  speciesHighlighted: DashboardSpecies[]
  totalSpeciesCount: number
}

export interface SpeciesHighlightedResponse {
  message: string
}

// Route
export const dashboardSpeciesDataRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-species-data`
export const speciesHighlightedPostRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species-highlighted-add`
export const speciesHighlightedDeleteRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species-highlighted-delete`

// Service
export const apiBioGetDashboardSpeciesDataRoute = async (apiClient: AxiosInstance, params: ProjectRouteParamsSerialized): Promise<DashboardSpeciesDataResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${params.projectId}/dashboard-species-data`)

export const apiBioPostSpeciesHighlighted = async (apiClient: AxiosInstance, locationProjectId: number, payload: SpeciesHighlightedBody): Promise<SpeciesHighlightedResponse> =>
  await apiClient.post(`/projects/${locationProjectId}/species-highlighted-add`, payload, { headers: { 'Content-Type': 'application/json' } }).then(res => res.data)

export const apiBioDeleteSpecieHighlighted = async (apiClient: AxiosInstance, locationProjectId: number, payload: SpeciesHighlightedBody): Promise<SpeciesHighlightedResponse> =>
  await apiClient.delete(`/projects/${locationProjectId}/species-highlighted-delete`, { data: payload }).then(res => res.data)
