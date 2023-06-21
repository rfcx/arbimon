import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type RfmCountParams, apiArbimonGetRfmCount } from '@rfcx-bio/common/api-arbimon/metrics/rfm-count'

export const useRfmCount = (apiClient: AxiosInstance, params: RfmCountParams): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-rfm-count'],
    async () => await apiArbimonGetRfmCount(apiClient, params)
  )
}
