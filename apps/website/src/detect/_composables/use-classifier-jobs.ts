import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiCoreGetClassifierJobAll, ClassifierJobAll, ClassifierJobAllParams } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-all'

export const useClassifierJobs = (apiClient: AxiosInstance, params?: ClassifierJobAllParams): UseQueryReturnType<ClassifierJobAll | undefined, unknown > => {
  return useQuery(
    ['fetch-classifier-jobs'],
    async () => await apiCoreGetClassifierJobAll(apiClient, params)
  )
}
