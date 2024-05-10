import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type superProjectSyncRoute, apiBioSuperGetSyncHistory, apiBioSuperStartSync } from '@rfcx-bio/common/api-bio/super/project-sync'
import { type SyncHistoryResponse } from '@rfcx-bio/common/api-bio/sync/sync-history'

import { type Error } from '@/super/error'

export const useFetchProjectSyncHistory = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<SyncHistoryResponse, Error> => {
  return useQuery<SyncHistoryResponse, Error>({
    queryKey: ['get-super-sync-history', projectId],
    queryFn: async () => {
      if (projectId === undefined) return { syncs: [] }
      return await apiBioSuperGetSyncHistory(apiClient, projectId) ?? []
    }
  })
}

export const useStartProjectSync = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, Error, typeof superProjectSyncRoute, unknown> => {
  return useMutation({
    mutationKey: ['post-super-sync'],
    mutationFn: async () => { await apiBioSuperStartSync(apiClient, projectId) }
  })
}
