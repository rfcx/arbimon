import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiCoreGetClassifierJobAll, ClassifierJobAll, ClassifierJobAllParams } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-all'

export const useClassifierJobs = (apiClient: AxiosInstance, variables?: ClassifierJobAllParams): UseQueryReturnType<ClassifierJobAll | undefined, unknown > => {
  if (variables?.created_by !== 'me') {
    delete variables?.created_by
  }
  return useQuery(
    ['fetch-classifier-jobs'],
    async () => await apiCoreGetClassifierJobAll(apiClient, variables)
  )
}
