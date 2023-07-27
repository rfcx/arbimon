import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { apiArbimonGetAedJobCount, apiArbimonGetClusteringJobCount, apiArbimonGetClusteringSpeciesDetected } from '@rfcx-bio/common/api-arbimon/metrics/aed-count'

export const useAedJobCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-aed-job-count', params],
    async () => await apiArbimonGetAedJobCount(apiClient, params?.value ?? '')
  )
}

export const useClusteringJobCount = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-clustering-job-count', params],
    async () => await apiArbimonGetClusteringJobCount(apiClient, params?.value ?? '')
  )
}

export const useClusteringSpeciesDetected = (apiClient: AxiosInstance, params: ComputedRef<string | undefined>): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery(
    ['fetch-clustering-species-detected', params],
    async () => await apiArbimonGetClusteringSpeciesDetected(apiClient, params?.value ?? '')
  )
}
