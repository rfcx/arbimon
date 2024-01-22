import { type AxiosInstance } from 'axios'

import { type ProjectRole } from '@/roles'
import { type LocationProjectUserRole, type UserProfile } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request type
export type ProjectMembersParams = ProjectRouteParamsSerialized

// Response type
export type ProjectMember = Omit<LocationProjectUserRole, 'createdAt' | 'updatedAt' | 'ranking'> & Pick<UserProfile, 'email' | 'firstName' | 'lastName' | 'image'>
export type ProjectMembersResponse = ProjectMember[]

export interface ProjectMemberAddRemoveRequest {
  email: string
  role?: Exclude<ProjectRole, 'none'>
}

// Route
export const projectMembersRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/members`

// Service
export const apiBioGetProjectMembers = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectMembersResponse> => {
  const response = await apiClient.get(projectMembersRoute.replace(':projectId', projectId.toString()))
  return response.data
}

export const apiBioAddProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberAddRemoveRequest): Promise<void> => {
  await apiClient.post(projectMembersRoute.replace(':projectId', projectId.toString()), { data: payload }).then(res => res.data)
}

export const apiBioRemoveProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberAddRemoveRequest): Promise<void> => {
  await apiClient.delete(projectMembersRoute.replace(':projectId', projectId.toString()), { data: payload }).then(res => res.data)
}
