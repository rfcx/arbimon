import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { apiArbimonGetJobsCount } from '@rfcx-bio/common/api-arbimon/metrics/jobs-count'
import { apiArbimonGetProjectsCount } from '@rfcx-bio/common/api-arbimon/metrics/project-count'
import { apiArbimonGetRecordingsCount } from '@rfcx-bio/common/api-arbimon/metrics/recordings-count'
import { apiArbimonGetRecordingsSpeciesCount } from '@rfcx-bio/common/api-arbimon/metrics/recordings-species-count'

export const useProjectsCount = (apiClient: AxiosInstance): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['project-count'],
    queryFn: async () => await apiArbimonGetProjectsCount(apiClient)
  })
}

export const useRecordingsCount = (apiClient: AxiosInstance): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['recording-count'],
    queryFn: async () => await apiArbimonGetRecordingsCount(apiClient)
  })
}

export const useRecordingsSpeciesCount = (apiClient: AxiosInstance): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['species-count'],
    queryFn: async () => await apiArbimonGetRecordingsSpeciesCount(apiClient)
  })
}

export const useJobsCount = (apiClient: AxiosInstance): UseQueryReturnType<number | undefined, unknown> => {
  return useQuery({
    queryKey: ['job-count'],
    queryFn: async () => await apiArbimonGetJobsCount(apiClient)
  })
}
