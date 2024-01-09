import { type AxiosInstance } from 'axios'

import { type LocationProjectUserRole, type UserProfile } from '../../dao/types'
import { type ProjectRouteParamsSerialized } from '../_helpers'

// Request type
export type GetProjectMembersParams = ProjectRouteParamsSerialized

// Response type
export type ProjectMember = Omit<LocationProjectUserRole, 'createdAt' | 'updatedAt' | 'ranking'> & Pick<UserProfile, 'email' | 'firstName' | 'lastName' | 'image'>
export type GetProjectMembersResponse = ProjectMember[]

// Route
export const getProjectMembersRoute = '/projects/:projectId/users'

// Service
export const apiBioGetProjectMembers = async (apiClient: AxiosInstance, locationProjectId: number): Promise<GetProjectMembersResponse> => {
  const response = await apiClient.get(`/projects/${locationProjectId}/users`)
  return response.data
}
