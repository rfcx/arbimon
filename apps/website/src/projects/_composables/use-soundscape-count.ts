import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetSoundscapeCount } from '@rfcx-bio/common/api-arbimon/metrics/soundscape-count'

export const useSoundscapeCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-soundscape-count', params],
    async () => await apiArbimonGetSoundscapeCount(apiClient, params?.value ?? '')
  )
}
