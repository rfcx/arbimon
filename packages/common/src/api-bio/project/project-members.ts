import { type AxiosInstance } from 'axios'

import { type LocationProjectUserRole, type UserProfile } from '../../dao/types'
import { type ProjectRole } from '../../roles'
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
export interface ProjectMemberUpdateRequest {
  email: string
  role: Exclude<ProjectRole, 'none'>
}

// Route
export const projectMembersRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/members`

// Service
export const apiBioGetProjectMembers = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectMembersResponse> => {
  return await apiClient.get(projectMembersRoute.replace(':projectId', projectId.toString())).then(res => res.data)
}

export const apiBioAddProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberAddRemoveRequest): Promise<void> => {
  await apiClient.post(projectMembersRoute.replace(':projectId', projectId.toString()), payload)
}

export const apiBioUpdateProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberUpdateRequest): Promise<void> => {
  await apiClient.patch(projectMembersRoute.replace(':projectId', projectId.toString()), payload)
}

export const apiBioRemoveProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberAddRemoveRequest): Promise<void> => {
  await apiClient.delete(projectMembersRoute.replace(':projectId', projectId.toString()), { data: payload })
}
