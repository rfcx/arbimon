import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type SpeciesCountParams, apiArbimonGetSpeciesCount } from '@rfcx-bio/common/api-arbimon/metrics/species-count'

export const useSpeciesCount = (apiClient: AxiosInstance, params: SpeciesCountParams): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-species-count'],
    async () => await apiArbimonGetSpeciesCount(apiClient, params)
  )
}
