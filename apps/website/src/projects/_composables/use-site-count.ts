import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { apiArbimonGetSiteCount } from '@rfcx-bio/common/api-arbimon/metrics/site-count'

export const useSiteCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-site-count', params],
    queryFn: async () => await apiArbimonGetSiteCount(apiClient, params?.value ?? '')
  })
}
