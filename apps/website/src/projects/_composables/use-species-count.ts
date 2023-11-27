import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { apiArbimonGetSpeciesCount } from '@rfcx-bio/common/api-arbimon/metrics/species-count'

export const useSpeciesCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-species-count', params],
    queryFn: async () => await apiArbimonGetSpeciesCount(apiClient, params?.value ?? '')
  })
}
