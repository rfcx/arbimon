import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type StreamAllResponse, apiCoreGetStreamAll } from '@rfcx-bio/common/api-core/stream/stream-all'

export const useGetStreamAll = (apiClient: AxiosInstance, coreProjectId: ComputedRef<string | undefined>): UseQueryReturnType< StreamAllResponse, unknown> => {
  return useQuery(
    ['get-core-project-location', coreProjectId],
    async () => await apiCoreGetStreamAll(apiClient, { projects: [coreProjectId?.value ?? ''] })
  )
}
