import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type Ref } from 'vue'

import { type GetClassifierJobsResponse, apiBioGetClassifierJobs } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

export const FETCH_CLASSIFIER_JOBS_KEY = 'fetch-classifier-jobs'

export const useClassifierJobs = (apiClient: AxiosInstance, projectId: string, createdBy: Ref<'me' | 'all'>): UseQueryReturnType<GetClassifierJobsResponse, unknown > => {
  return useQuery({
    queryKey: [FETCH_CLASSIFIER_JOBS_KEY, projectId, createdBy],
    queryFn: async () => await apiBioGetClassifierJobs(apiClient, projectId, createdBy.value)
  })
}
