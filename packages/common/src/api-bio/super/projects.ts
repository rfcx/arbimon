import { type AxiosInstance } from 'axios'

import { type LocationProjectTypes } from '../../dao/types'
import { type ProjectMemberAddRemoveRequest, type ProjectMembersResponse, type ProjectMemberUpdateRequest } from '../project/project-members'

// Route
export const superProjectsRoute = '/super/projects'
export const superProjectMembersRoute = superProjectsRoute + '/:projectId/members'

// Service
export const apiBioSuperGetProjects = async (apiClient: AxiosInstance, options: { keyword?: string, limit?: number, offset?: number }): Promise<Array<LocationProjectTypes['light']>> =>
  await apiClient.get<Array<LocationProjectTypes['light']>>(superProjectsRoute, { params: options }).then(res => res.data)

export const apiBioSuperGetProjectMembers = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectMembersResponse> => {
  return await apiClient.get(superProjectMembersRoute.replace(':projectId', projectId.toString())).then(res => res.data)
}

export const apiBioSuperAddProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberAddRemoveRequest): Promise<void> => {
  await apiClient.post(superProjectMembersRoute.replace(':projectId', projectId.toString()), payload)
}

export const apiBioSuperUpdateProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberUpdateRequest): Promise<void> => {
  await apiClient.patch(superProjectMembersRoute.replace(':projectId', projectId.toString()), payload)
}

export const apiBioSuperRemoveProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberAddRemoveRequest): Promise<void> => {
  await apiClient.delete(superProjectMembersRoute.replace(':projectId', projectId.toString()), { data: payload })
}
