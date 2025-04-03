import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type SiteParams, type SitesResponse, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

export const useSites = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>, request: ComputedRef<SiteParams | undefined>): UseQueryReturnType<SitesResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-sites', params],
    queryFn: async () => await apiArbimonGetSites(apiClient, params?.value ?? '', request.value ?? { count: true, deployment: true, logs: true })
  })
}
