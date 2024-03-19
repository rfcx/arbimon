import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type DashboardSpecies } from '../../api-bio/dashboard/common'
import { type SpeciesInProjectTypes } from '../../dao/types/species-in-project'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectSpeciesParams = ProjectRouteParamsSerialized

export type ProjectSpeciesFieldSet = 'light' | 'dashboard'

export interface ProjectSpeciesQueryParams {
  limit?: number
  offset?: number
  fields?: ProjectSpeciesFieldSet
}

// Response types
export interface ProjectSpeciesResponse {
  species: Array<SpeciesInProjectTypes[ProjectSpeciesFieldSet] | DashboardSpecies>
  total: number
}

// Route
export const projectSpeciesRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species`

// Service
export const apiBioGetProjectSpecies = async (apiClient: AxiosInstance, projectId: number, params: ProjectSpeciesQueryParams = {}): Promise<ProjectSpeciesResponse | undefined> =>
    await apiGetOrUndefined(apiClient, `/projects/${projectId}/species`, { params })
