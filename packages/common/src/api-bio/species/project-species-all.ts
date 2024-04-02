import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type DashboardSpecies } from '../../api-bio/dashboard/common'
import { type SpeciesInProjectTypes } from '../../dao/types/species-in-project'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectSpeciesParams = ProjectRouteParamsSerialized
export type ProjectRiskRatingsParams = ProjectRouteParamsSerialized

export type ProjectSpeciesFieldSet = 'light' | 'dashboard'

export interface ProjectSpeciesQueryParams {
  limit?: number
  offset?: number
  fields?: ProjectSpeciesFieldSet
  keyword?: string
  riskRatingId?: string
}

// Response types
export interface ProjectSpeciesResponse {
  species: Array<SpeciesInProjectTypes[ProjectSpeciesFieldSet] | DashboardSpecies>
  total: number
}

export interface ProjectRiskRatingsResponse {
  riskRatings: RiskRating[]
}
export interface RiskRating { code: string, id: number }

// Route
export const projectSpeciesRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/species`
export const projectRiskRatingsRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/risk-ratings`

// Service
export const apiBioGetProjectSpecies = async (apiClient: AxiosInstance, projectId: number, params: ProjectSpeciesQueryParams = {}): Promise<ProjectSpeciesResponse | undefined> =>
    await apiGetOrUndefined(apiClient, `/projects/${projectId}/species`, { params })

export const apiBioGetProjectRiskRatings = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectRiskRatingsResponse | undefined> =>
    await apiGetOrUndefined(apiClient, `/projects/${projectId}/risk-ratings`)
