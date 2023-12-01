import { type AxiosInstance } from 'axios'

import { type CoreUser } from '@/api-core/project/users'

// Request type
export interface GetProjectMembersParams {
  projectId: string
}

// Response type
export type GetProjectMembersResponse = CoreUser[]

// Route
export const getProjectMembersRoute = '/projects/:projectId/users'

// Service
export const apiBioGetProjectMembers = async (apiClient: AxiosInstance, locationProjectId: number): Promise<GetProjectMembersResponse> => {
  const response = await apiClient.get(`/projects/${locationProjectId}/users`)
  return response.data
}
