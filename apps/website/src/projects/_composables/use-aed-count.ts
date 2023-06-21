import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type AedCountParams, apiArbimonGetAedCount } from '@rfcx-bio/common/api-arbimon/metrics/aed-count'

export const useAedCount = (apiClient: AxiosInstance, params: AedCountParams): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-aed-count'],
    async () => await apiArbimonGetAedCount(apiClient, params)
  )
}
