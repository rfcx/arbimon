import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef, type Ref } from 'vue'

import { type ProjectMemberAddRemoveRequest, type ProjectMembersResponse, type ProjectMemberUpdateRequest, apiBioAddProjectMember, apiBioGetProjectMembers, apiBioRemoveProjectMember, apiBioUpdateProjectMember } from '@rfcx-bio/common/api-bio/project/project-members'
import { type UsersLightResponse, type UsersRequestQueryParams, apiGetUsers } from '@rfcx-bio/common/api-bio/users/profile'

export const useGetProjectMembers = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<ProjectMembersResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-members', projectId],
    queryFn: async () => await apiBioGetProjectMembers(apiClient, projectId?.value ?? -1)
  })
}

export const useSearchUsers = (apiClient: AxiosInstance, q: Ref<string>, enabled: ComputedRef<boolean>): UseQueryReturnType<UsersLightResponse, UsersRequestQueryParams> => {
  return useQuery({
    queryKey: ['get-search-users'],
    queryFn: async () => await apiGetUsers(apiClient, { q: q.value === '' ? undefined : q.value }),
    enabled
  })
}

export const useAddProjectMember = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, unknown, ProjectMemberAddRemoveRequest, unknown> => {
  return useMutation({
    mutationKey: ['post-project-member'],
    mutationFn: async (payload: ProjectMemberAddRemoveRequest) => { await apiBioAddProjectMember(apiClient, projectId, payload) }
  })
}

export const useUpdateProjectMember = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, unknown, ProjectMemberUpdateRequest, unknown> => {
  return useMutation({
    mutationKey: ['patch-project-member'],
    mutationFn: async (payload: ProjectMemberUpdateRequest) => { await apiBioUpdateProjectMember(apiClient, projectId, payload) }
  })
}

export const useDeleteProjectMember = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, unknown, string, unknown> => {
  return useMutation({
    mutationKey: ['delete-project-member'],
    mutationFn: async (email: string) => { await apiBioRemoveProjectMember(apiClient, projectId, { email }) }
  })
}
