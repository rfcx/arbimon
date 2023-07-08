import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetAedCount } from '@rfcx-bio/common/api-arbimon/metrics/aed-count'

export const useAedCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-aed-count', params],
    async () => await apiArbimonGetAedCount(apiClient, params?.value ?? '')
  )
}
