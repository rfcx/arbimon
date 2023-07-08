import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetPmCount } from '@rfcx-bio/common/api-arbimon/metrics/pm-count'

export const usePmCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-pm-count', params],
    async () => await apiArbimonGetPmCount(apiClient, params?.value ?? '')
  )
}
