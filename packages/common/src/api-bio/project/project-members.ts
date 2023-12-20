import { type AxiosInstance } from 'axios'

import { type LocationProjectUserRole } from '../../dao/types'

// Request type
export interface GetProjectMembersParams {
  projectId: string
}

// Response type
export type GetProjectMembersResponse = Array<Omit<LocationProjectUserRole, 'createdAt' | 'updatedAt' | 'ranking'> & { email: string }>

// Route
export const getProjectMembersRoute = '/projects/:projectId/users'

// Service
export const apiBioGetProjectMembers = async (apiClient: AxiosInstance, locationProjectId: number): Promise<GetProjectMembersResponse> => {
  const response = await apiClient.get(`/projects/${locationProjectId}/users`)
  return response.data
}
