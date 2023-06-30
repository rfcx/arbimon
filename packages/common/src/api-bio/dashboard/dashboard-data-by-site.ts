import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ApiMap, type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type DashboardDataBySiteParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardDataBySiteResponse {
  richnessBySite: ApiMap
  detectionBySite: ApiMap
}

// Route
export const dashboardDataBySiteRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-data-by-site`

// Service
export const apiBioGetDashboardDataBySite = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardDataBySiteResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/dashboard-data-by-site`)
