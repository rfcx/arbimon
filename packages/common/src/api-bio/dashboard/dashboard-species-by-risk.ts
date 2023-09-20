import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type DashboardSpecies } from './common'

// Request types
export type DashboardSpeciesByRiskParams = ProjectRouteParamsSerialized

export interface DashboardSpeciesByRiskQuery {
  riskRatingId: string
}

// Response types
export interface DashboardSpeciesByRiskDataResponse {
  species: DashboardSpecies[]
}

// Route
export const dashboardSpeciesByRiskDataRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-species-by-risk`

// Service
export const apiBioGetDashboardSpeciesByRiskDataRoute = async (apiClient: AxiosInstance, params: ProjectRouteParamsSerialized, query: DashboardSpeciesByRiskQuery): Promise<DashboardSpeciesByRiskDataResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${params.projectId}/dashboard-species-by-risk?riskRatingId=${query.riskRatingId}`)
