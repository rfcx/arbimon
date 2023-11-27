import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { apiArbimonGetPmSpeciesCount } from '@rfcx-bio/common/api-arbimon/metrics/pm-count'

export const usePmSpeciesDetected = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-pm-species-detected', params],
    queryFn: async () => await apiArbimonGetPmSpeciesCount(apiClient, params?.value ?? '')
  })
}

export const usePmTemplateCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-pm-template-count', params],
    queryFn: async () => await apiArbimonGetPmSpeciesCount(apiClient, params?.value ?? '')
  })
}
