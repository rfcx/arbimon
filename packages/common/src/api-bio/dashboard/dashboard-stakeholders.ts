import { type AxiosInstance } from 'axios'

import { type LocationProjectUserRole, type OrganizationTypes, type UserProfile } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// The `GET` Service

// Request types
export type DashboardStakeholdersParams = ProjectRouteParamsSerialized

// Response types
export type DashboardStakeholdersUser = Pick<UserProfile, 'email' | 'firstName' | 'lastName' | 'id' | 'image'> & Pick<LocationProjectUserRole, 'roleId' | 'ranking'>
export interface DashboardStakeholdersResponse {
  users: DashboardStakeholdersUser[]
  organizations: Array<OrganizationTypes['light']>
}

// Route
export const dashboardStakeholdersRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-stakeholders`

// Service
export const apiBioGetDashboardStakeholders = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardStakeholdersResponse> => {
  const response = await apiClient.get(`/projects/${projectId}/dashboard-stakeholders`)
  return response.data
}

// The `PATCH` Organization Service

// Request types
export type UpdateDashboardStakeholdersParams = ProjectRouteParamsSerialized

export interface UpdateDashboardStakeholdersRequestBody {
  /** Array of organization ids */
  organizations: number[]
  /** Array of user id and their rank */
  users: UpdateDashboardStakeholdersRequestBodyUser[]
}

export type UpdateDashboardStakeholdersRequestBodyUser = Pick<LocationProjectUserRole, 'ranking' | 'userId'>

// Route
export const updateDashboardStakeholdersRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-stakeholders`

// Service
export const apiBioUpdateDashboardStakeholders = async (apiClient: AxiosInstance, projectId: number, usersAndOrganizations: UpdateDashboardStakeholdersRequestBody): Promise<void> => {
  await apiClient.patch(`/projects/${projectId}/dashboard-stakeholders`, usersAndOrganizations)
}
