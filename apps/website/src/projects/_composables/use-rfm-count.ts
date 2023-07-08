import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetRfmCount } from '@rfcx-bio/common/api-arbimon/metrics/rfm-count'

export const useRfmCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-rfm-count', params],
    async () => await apiArbimonGetRfmCount(apiClient, params?.value ?? '')
  )
}
