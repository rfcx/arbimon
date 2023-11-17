import { type AxiosInstance } from 'axios'

import { type OrganizationTypes } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// The `GET` Service

// Request types
export type DashboardStakeholdersParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardStakeholdersResponse {
  // FIXME: User type has not been finalized yet.
  user: Array<{ id: number, name: string, description: string }>
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
