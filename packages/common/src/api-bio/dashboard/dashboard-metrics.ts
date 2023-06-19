import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type DashboardMetricsParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardMetricsResponse {
  detectionMinutesCount: number
  siteCount: number
  speciesCount: string
  maxDate?: Date
  minDate?: Date
}

// Route
export const dashboardMetricsRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-metrics`

// Service
export const apiBioGetDashboardMetrics = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardMetricsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/dashboard-metrics`)
