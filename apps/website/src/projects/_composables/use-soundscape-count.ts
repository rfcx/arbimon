import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type SoundscapeCountParams, apiArbimonGetSoundscapeCount } from '@rfcx-bio/common/api-arbimon/metrics/soundscape-count'

export const useSoundscapeCount = (apiClient: AxiosInstance, params: SoundscapeCountParams): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-soundscape-count'],
    async () => await apiArbimonGetSoundscapeCount(apiClient, params)
  )
}
