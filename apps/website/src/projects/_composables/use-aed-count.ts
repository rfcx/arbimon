import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { apiArbimonGetAedJobCount, apiArbimonGetClusteringJobCount, apiArbimonGetClusteringSpeciesDetected } from '@rfcx-bio/common/api-arbimon/metrics/aed-count'

export const useAedJobCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-aed-job-count', params],
    queryFn: async () => await apiArbimonGetAedJobCount(apiClient, params?.value ?? '')
  })
}

export const useClusteringJobCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-clustering-job-count', params],
    queryFn: async () => await apiArbimonGetClusteringJobCount(apiClient, params?.value ?? '')
  })
}

export const useClusteringSpeciesDetected = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-clustering-species-detected', params],
    queryFn: async () => await apiArbimonGetClusteringSpeciesDetected(apiClient, params?.value ?? '')
  })
}
