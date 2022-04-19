import { computed } from 'vue'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { SyncHistoryParams, SyncHistoryResponse, syncHistoryUrl } from '@rfcx-bio/common/api-bio/sync'

import { apiClient } from '~/api'
import { useStoreOutsideSetup } from '~/store'

const store = useStoreOutsideSetup()
const projectId = computed(() => store.selectedProject?.id)

export const useSyncHistory = (): UseQueryReturnType<SyncHistoryResponse, unknown> =>
  useQuery(['fetch-sync-history', projectId], async () => {
    if (projectId.value === undefined) return { syncs: [] }

    const params: SyncHistoryParams = { projectId: projectId.value.toString() }
    return await apiClient.get<SyncHistoryResponse>(`${import.meta.env.VITE_BIO_API_BASE_URL}${syncHistoryUrl(params)}`) ?? []
  })
