import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type PlaylistCountParams, apiArbimonGetPlaylistCount } from '@rfcx-bio/common/api-arbimon/metrics/playlist-count'

export const usePlaylistCount = (apiClient: AxiosInstance, params: PlaylistCountParams): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-playlist-count'],
    async () => await apiArbimonGetPlaylistCount(apiClient, params)
  )
}
