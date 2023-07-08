import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetSiteCount } from '@rfcx-bio/common/api-arbimon/metrics/site-count'

export const useSiteCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-site-count', params],
    async () => await apiArbimonGetSiteCount(apiClient, params?.value ?? '')
  )
}
