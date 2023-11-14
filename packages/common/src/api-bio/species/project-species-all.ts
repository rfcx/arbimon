import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type SpeciesInProjectTypes } from '../../dao/types/species-in-project'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type DashboardSpecies } from '../dashboard/common'

// Request types
export type ProjectSpeciesAllParams = ProjectRouteParamsSerialized

export interface ProjectSpeciesQueryParams {
  limit?: number
  offset?: number
}

// Response types
export interface ProjectSpeciesLightResponse {
  species: Array<SpeciesInProjectTypes['light']>
}
export interface ProjectSpeciesAllResponse {
  species: DashboardSpecies[]
}

// Route
export const projectSpeciesLightRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species`
export const projectSpeciesAllRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species-all`

// Service
export const apiBioGetProjectSpeciesLight = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectSpeciesLightResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/species`)

export const apiBioGetProjectSpeciesAll = async (apiClient: AxiosInstance, projectId: number, params: ProjectSpeciesQueryParams = {}): Promise<ProjectSpeciesAllResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/species-all`, { params })
