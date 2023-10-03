import { type AxiosInstance } from 'axios'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type DashboardMetricsParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardMetricsResponse {
  /** Number of sites with recorders deployed */
  deploymentSites: number
  /** Number of NT, VU, EN, and CR species */
  threatenedSpecies: number
  /** Number of all detected species */
  totalSpecies: number
  /** Total number of species calls detected */
  totalDetections: number
  /** total recordings in minutes */
  totalRecordings: number
  maxDate: Date | null
  minDate: Date | null
}

export interface DashboardMinMaxDatesResponse {
  maxDate: Date | null
  minDate: Date | null
}

// Route
export const dashboardMetricsRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-metrics`

// Service
export const apiBioGetDashboardMetrics = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardMetricsResponse> => {
  const response = await apiClient.get(`/projects/${projectId}/dashboard-metrics`)
  return response.data
}
