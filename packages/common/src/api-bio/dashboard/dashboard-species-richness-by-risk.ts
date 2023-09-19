import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ApiStack, type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Response types
export interface DashboardSpeciesRishnessByRiskDataResponse {
  richnessByRisk: ApiStack
  totalSpeciesCount: number
}

// Route
export const dashboardSpeciesRichnessByRiskDataRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-species-richness-by-risk`

// Service
export const apiBioGetDashboardSpeciesRishnessByRiskDataRoute = async (apiClient: AxiosInstance, params: ProjectRouteParamsSerialized): Promise<DashboardSpeciesRishnessByRiskDataResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${params.projectId}/dashboard-species-richness-by-risk`)
