import { AxiosInstance } from 'axios'
import { computed } from 'vue'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiBioGetSyncHistory, SyncHistoryParams, SyncHistoryResponse } from '@rfcx-bio/common/api-bio/sync/sync-history'

import { useStoreOutsideSetup } from '~/store'

const store = useStoreOutsideSetup()
const projectId = computed(() => store.selectedProject?.id)

export const useSyncHistory = (apiClient: AxiosInstance): UseQueryReturnType<SyncHistoryResponse, unknown> =>
  useQuery(['fetch-sync-history', projectId], async () => {
    if (projectId.value === undefined) return { syncs: [] }

    const params: SyncHistoryParams = { projectId: projectId.value.toString() }
    return await apiBioGetSyncHistory(apiClient, params) ?? []
  })
