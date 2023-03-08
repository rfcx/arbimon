import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type ClassifierJobAll, type ClassifierJobAllParams, apiCoreGetClassifierJobAll } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-all'

export const FETCH_CLASSIFIER_JOBS_KEY = 'fetch-classifier-jobs'

export const useClassifierJobs = (apiClient: AxiosInstance, params?: ClassifierJobAllParams): UseQueryReturnType<ClassifierJobAll | undefined, unknown > => {
  return useQuery(
    [FETCH_CLASSIFIER_JOBS_KEY, params],
    async () => await apiCoreGetClassifierJobAll(apiClient, params)
  )
}
