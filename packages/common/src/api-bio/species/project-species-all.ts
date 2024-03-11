import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { SpeciesInProject } from '@/dao/types/species-in-project'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type DashboardSpecies } from '../dashboard/common'

// Request types
export type ProjectSpeciesAllParams = ProjectRouteParamsSerialized
export type ProjectSpeciesParams = ProjectRouteParamsSerialized

type ProjectSpeciesFieldSet = 'light' | 'dashboard'

export interface ProjectSpeciesQueryParams {
  limit?: number
  offset?: number
  fields?: ProjectSpeciesFieldSet
}

// Response types
// TODO: delete
export interface ProjectSpeciesAllResponse {
  species: DashboardSpecies[]
}

export interface ProjectSpeciesResponse {
  species: Array<Partial<SpeciesInProject>>
}

// Route
export const projectSpeciesRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species`

// Service
// TODO: delete
export const apiBioGetProjectSpeciesAll = async (apiClient: AxiosInstance, projectId: number, params: ProjectSpeciesQueryParams = {}): Promise<ProjectSpeciesAllResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/species-all`, { params })

export const apiBioGetProjectSpecies = async (apiClient: AxiosInstance, projectId: number, params: ProjectSpeciesQueryParams = {}): Promise<ProjectSpeciesResponse | undefined> =>
    await apiGetOrUndefined(apiClient, `/projects/${projectId}/species`, { params })
