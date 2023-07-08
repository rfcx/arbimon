import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetPlaylistCount } from '@rfcx-bio/common/api-arbimon/metrics/playlist-count'

export const usePlaylistCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-playlist-count', params],
    async () => await apiArbimonGetPlaylistCount(apiClient, params?.value ?? '')
  )
}
