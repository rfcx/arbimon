import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type DashboardContentParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardContentResponse {
  summary: string
  readme: string // markdown string
}

// Route
export const dashboardContentRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-content`

// Service
export const apiBioGetDashboardContent = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardContentResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/dashboard-content`)
