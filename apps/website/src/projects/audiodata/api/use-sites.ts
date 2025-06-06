import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type AssetItem, type SiteParams, type SitesResponse, apiArbimonGetAssets, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

export const useGetAssets = (apiClient: AxiosInstance, siteId: string): UseQueryReturnType<AssetItem[] | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-get-assets-site-id', siteId],
    queryFn: async () => await apiArbimonGetAssets(apiClient, siteId)
  })
}

export const useSites = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>, request: ComputedRef<SiteParams | undefined>): UseQueryReturnType<SitesResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-sites', params],
    queryFn: async () => await apiArbimonGetSites(apiClient, params?.value ?? '', request.value ?? { count: true, deployment: true, logs: true })
  })
}
