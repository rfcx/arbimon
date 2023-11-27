import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { apiArbimonGetSoundscapeCount } from '@rfcx-bio/common/api-arbimon/metrics/soundscape-count'

export const useSoundscapeCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-soundscape-count', params],
    queryFn: async () => await apiArbimonGetSoundscapeCount(apiClient, params?.value ?? '')
  })
}
