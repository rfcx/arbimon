import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetPmSpeciesCount } from '@rfcx-bio/common/api-arbimon/metrics/pm-count'

export const usePmSpeciesCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-pm-species-count', params],
    async () => await apiArbimonGetPmSpeciesCount(apiClient, params?.value ?? '')
  )
}

export const usePmTemplateCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-pm-template-count', params],
    async () => await apiArbimonGetPmSpeciesCount(apiClient, params?.value ?? '')
  )
}
