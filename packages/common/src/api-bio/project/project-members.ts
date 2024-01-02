import { type AxiosInstance } from 'axios'

import { type LocationProjectUserRole } from '../../dao/types'
import { type ProjectRouteParamsSerialized } from '../_helpers'

// Request type
export type GetProjectMembersParams = ProjectRouteParamsSerialized

// Response type
export type GetProjectMembersResponse = Array<Omit<LocationProjectUserRole, 'createdAt' | 'updatedAt' | 'ranking'> & { email: string }>

// Route
export const getProjectMembersRoute = '/projects/:projectId/users'

// Service
export const apiBioGetProjectMembers = async (apiClient: AxiosInstance, locationProjectId: number): Promise<GetProjectMembersResponse> => {
  const response = await apiClient.get(`/projects/${locationProjectId}/users`)
  return response.data
}
