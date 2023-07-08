import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetSpeciesCount } from '@rfcx-bio/common/api-arbimon/metrics/species-count'

export const useSpeciesCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-species-count', params],
    async () => await apiArbimonGetSpeciesCount(apiClient, params?.value ?? '')
  )
}
