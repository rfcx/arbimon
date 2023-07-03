import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ApiLine, type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type DashboardDataByHourParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardDataByHourResponse {
  richnessByHour: ApiLine
  detectionByHour: ApiLine
}

// Route
export const dashboardDataByHourRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-data-by-hour`

// Service
export const apiBioGetDashboardDataByHour = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardDataByHourResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/dashboard-data-by-hour`)
