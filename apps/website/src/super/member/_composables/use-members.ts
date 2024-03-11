import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type ProjectMemberAddRemoveRequest, type ProjectMembersResponse, type ProjectMemberUpdateRequest } from '@rfcx-bio/common/api-bio/project/project-members'
import { apiBioSuperAddProjectMember, apiBioSuperGetProjectMembers, apiBioSuperRemoveProjectMember, apiBioSuperUpdateProjectMember } from '@rfcx-bio/common/api-bio/super/projects'

import { type Error } from '../../error'

export const useSuperGetProjectMembers = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<ProjectMembersResponse, Error> => {
  return useQuery({
    queryKey: ['get-super-project-members', projectId],
    queryFn: async () => await apiBioSuperGetProjectMembers(apiClient, projectId),
    retry: 0,
    staleTime: 1000
  })
}

export const useSuperAddProjectMember = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, Error, ProjectMemberAddRemoveRequest, unknown> => {
  return useMutation({
    mutationKey: ['post-super-project-member'],
    mutationFn: async (payload: ProjectMemberAddRemoveRequest) => { await apiBioSuperAddProjectMember(apiClient, projectId, payload) }
  })
}

export const useSuperDeleteProjectMember = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, Error, string, unknown> => {
  return useMutation({
    mutationKey: ['delete-super-project-member'],
    mutationFn: async (email: string) => { await apiBioSuperRemoveProjectMember(apiClient, projectId, { email }) }
  })
}

export const useSuperUpdateProjectMember = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, Error, ProjectMemberUpdateRequest, unknown> => {
  return useMutation({
    mutationKey: ['patch-super-project-member'],
    mutationFn: async (payload: ProjectMemberUpdateRequest) => { await apiBioSuperUpdateProjectMember(apiClient, projectId, payload) }
  })
}
