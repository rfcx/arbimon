import { type AxiosInstance } from 'axios'
import { computed } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type SyncHistoryParams, type SyncHistoryResponse, apiBioGetSyncHistory } from '@rfcx-bio/common/api-bio/sync/sync-history'

import { useStoreOutsideSetup } from '~/store'

const store = useStoreOutsideSetup()
const projectId = computed(() => store.selectedProject?.id)

export const useSyncHistory = (apiClient: AxiosInstance): UseQueryReturnType<SyncHistoryResponse, unknown> =>
  useQuery(['fetch-sync-history', projectId], async () => {
    if (projectId.value === undefined) return { syncs: [] }

    const params: SyncHistoryParams = { projectId: projectId.value.toString() }
    return await apiBioGetSyncHistory(apiClient, params) ?? []
  })
