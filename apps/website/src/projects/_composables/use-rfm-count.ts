import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetRfmJobCount, apiArbimonGetRfmSpeciesDetected } from '@rfcx-bio/common/api-arbimon/metrics/rfm-count'

export const useRfmJobCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-rfm-job-count', params],
    async () => await apiArbimonGetRfmJobCount(apiClient, params?.value ?? '')
  )
}

export const useRfmSpeciesDetected = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-rfm-species-detected', params],
    async () => await apiArbimonGetRfmSpeciesDetected(apiClient, params?.value ?? '')
  )
}
