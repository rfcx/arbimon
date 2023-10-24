import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type LocationProjectProfile, type LocationProjectProfileContentType } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// The `GET` service

// Request types
export type DashboardContentParams = ProjectRouteParamsSerialized

// Response types
export type DashboardContentResponse = Omit<LocationProjectProfile, 'summary'> & { editable: boolean }

// Route (They both share the same route, different method)
export const dashboardContentRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-content`

// Service
export const apiBioGetDashboardContent = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardContentResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/dashboard-content`)

// The `PATCH` service

// Request types
export type UpdateDashboardContentParams = ProjectRouteParamsSerialized

export interface UpdateDashboardContentRequestBody {
  contentType: LocationProjectProfileContentType
  value: string
}

// Response type
export interface UpdateDashboardContentResponse {
  message: string
}

// Service
export const apiBioUpdateDashboardContent = async (apiClient: AxiosInstance, locationProjectId: number, contentType: LocationProjectProfileContentType, value: string): Promise<UpdateDashboardContentResponse> => {
  return await apiClient.patch(`/projects/${locationProjectId}/dashboard-content`, { contentType, value })
}
