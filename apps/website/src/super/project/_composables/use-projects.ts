import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type Ref, computed } from 'vue'

import { type SuperPaginationResponse, type SuperProjectSummary, type SuperProjectTierUpdateBody, type SuperUserSummary, type SuperUserTierUpdateBody, apiBioSuperGetProjects, apiBioSuperGetUserProjects, apiBioSuperGetUsers, apiBioSuperUpdateProjectTier, apiBioSuperUpdateUserTier } from '@rfcx-bio/common/api-bio/super/projects'

import { type Error } from '../../error'

export const useGetSuperProjects = (
  apiClient: AxiosInstance,
  options: { keyword?: Ref<string>, tier?: Ref<SuperProjectSummary['projectType'] | undefined>, limit?: Ref<number>, offset?: Ref<number>, enabled?: Ref<boolean> }
): UseQueryReturnType<SuperPaginationResponse<SuperProjectSummary>, Error> => {
  return useQuery({
    queryKey: ['get-projects', options.keyword, options.tier, options.limit, options.offset],
    queryFn: async () => await apiBioSuperGetProjects(apiClient, { keyword: options.keyword?.value, tier: options.tier?.value, limit: options.limit?.value, offset: options.offset?.value }),
    enabled: computed(() => options.enabled?.value ?? true),
    retry: 0,
    staleTime: 1000
  })
}

export const useGetSuperUsers = (
  apiClient: AxiosInstance,
  options: { keyword?: Ref<string>, tier?: Ref<SuperUserSummary['accountTier'] | undefined>, limit?: Ref<number>, offset?: Ref<number>, enabled?: Ref<boolean> }
): UseQueryReturnType<SuperPaginationResponse<SuperUserSummary>, Error> => {
  return useQuery({
    queryKey: ['get-super-users', options.keyword, options.tier, options.limit, options.offset],
    queryFn: async () => await apiBioSuperGetUsers(apiClient, { keyword: options.keyword?.value, tier: options.tier?.value, limit: options.limit?.value, offset: options.offset?.value }),
    enabled: computed(() => options.enabled?.value ?? true),
    retry: 0,
    staleTime: 1000
  })
}

export const useGetSuperUserProjects = (apiClient: AxiosInstance, userId: Ref<number | null | undefined>): UseQueryReturnType<SuperProjectSummary[], Error> => {
  return useQuery({
    queryKey: ['get-super-user-projects', userId],
    queryFn: async () => await apiBioSuperGetUserProjects(apiClient, Number(userId.value)),
    enabled: computed(() => userId.value !== undefined && userId.value !== null),
    retry: 0,
    staleTime: 1000
  })
}

export const useUpdateSuperProjectTier = (apiClient: AxiosInstance): UseMutationReturnType<void, Error, { projectId: number, payload: SuperProjectTierUpdateBody }, unknown> => {
  return useMutation({
    mutationKey: ['update-super-project-tier'],
    mutationFn: async ({ projectId, payload }) => { await apiBioSuperUpdateProjectTier(apiClient, projectId, payload) }
  })
}

export const useUpdateSuperUserTier = (apiClient: AxiosInstance): UseMutationReturnType<void, Error, { userId: number, payload: SuperUserTierUpdateBody }, unknown> => {
  return useMutation({
    mutationKey: ['update-super-user-tier'],
    mutationFn: async ({ userId, payload }) => { await apiBioSuperUpdateUserTier(apiClient, userId, payload) }
  })
}
