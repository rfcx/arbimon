import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { apiArbimonGetRfmJobCount, apiArbimonGetRfmSpeciesDetected } from '@rfcx-bio/common/api-arbimon/metrics/rfm-count'

export const useRfmJobCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-rfm-job-count', params],
    queryFn: async () => await apiArbimonGetRfmJobCount(apiClient, params?.value ?? '')
  })
}

export const useRfmSpeciesDetected = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-rfm-species-detected', params],
    queryFn: async () => await apiArbimonGetRfmSpeciesDetected(apiClient, params?.value ?? '')
  })
}
