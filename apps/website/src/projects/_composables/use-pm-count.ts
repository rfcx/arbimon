import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type PmCountParams, apiArbimonGetPmCount } from '@rfcx-bio/common/api-arbimon/metrics/pm-count'

export const usePmCount = (apiClient: AxiosInstance, params: PmCountParams): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-pm-count'],
    async () => await apiArbimonGetPmCount(apiClient, params)
  )
}
