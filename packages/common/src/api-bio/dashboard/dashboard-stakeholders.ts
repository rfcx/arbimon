import { type AxiosInstance } from 'axios'

import { type LocationProjectUserRole, type OrganizationTypes, type UserProfile } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// The `GET` Service

// Request types
export type DashboardStakeholdersParams = ProjectRouteParamsSerialized

// Response types
export type DashboardStakeholdersUser = Pick<UserProfile, 'email' | 'firstName' | 'lastName' | 'id' | 'image'> & Pick<LocationProjectUserRole, 'roleId' | 'ranking'>
export interface DashboardStakeholdersResponse {
  user: DashboardStakeholdersUser[]
  organization: Array<OrganizationTypes['light']>
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
export type UpdateDashboardStakeholderOrganizationsParams = ProjectRouteParamsSerialized

export interface UpdateDashboardStakeholderOrganizationsRequestBody {
  // Array of organization ids
  organizations: number[]
}

// Response types
export interface UpdateDashboardStakeholderOrganizationsResponseBody {
  message: string
}

// Route
export const updateDashboardStakeholderOrganizationsRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-stakeholders/organizations`

// Service
export const apiBioUpdateDashboardStakeholderOrganizations = async (apiClient: AxiosInstance, projectId: number, organizations: number[]): Promise<UpdateDashboardStakeholderOrganizationsResponseBody> => {
  const response = await apiClient.patch(`/projects/${projectId}/dashboard-stakeholders/organizations`, {
    organizations
  })

  return response.data
}
