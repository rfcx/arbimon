import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { apiArbimonGetPlaylistCount } from '@rfcx-bio/common/api-arbimon/metrics/playlist-count'

export const usePlaylistCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-playlist-count', params],
    queryFn: async () => await apiArbimonGetPlaylistCount(apiClient, params?.value ?? '')
  })
}
