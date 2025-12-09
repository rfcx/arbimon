import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type AssetItem, type SiteParams, type SitesResponse, apiArbimonGetAssets, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

export const useSites = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>, request: ComputedRef<SiteParams | undefined>): UseQueryReturnType<SitesResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-sites', params],
    queryFn: async () => await apiArbimonGetSites(apiClient, params?.value ?? '', request.value ?? { count: true, deployment: true, logs: true }),
    refetchOnWindowFocus: false
  })
}

export const apiDeviceGetAssets = async (apiClient: AxiosInstance, url: string): Promise<Blob | undefined> => {
  return await apiGetOrUndefined(apiClient, url, { responseType: 'blob' })
}

export const useGetAssets = async (apiClient: AxiosInstance, siteId: string): Promise<AssetItem[] | undefined> => {
  return await apiArbimonGetAssets(apiClient, siteId)
}
