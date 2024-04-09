import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type GetClassifierJobsResponse, apiBioGetClassifierJobs } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

export const FETCH_CLASSIFIER_JOBS_KEY = 'fetch-classifier-jobs'

export const useClassifierJobs = (apiClient: AxiosInstance, params: { projectId: string, createdBy: 'me' | 'all' }): UseQueryReturnType<GetClassifierJobsResponse | undefined, unknown> => {
  return useQuery({
    queryKey: [FETCH_CLASSIFIER_JOBS_KEY, params],
    queryFn: async () => await apiBioGetClassifierJobs(apiClient, params.projectId, params.createdBy)
  })
}
