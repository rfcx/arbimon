import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type ClassifierAllResponse, apiCoreGetClassifierAll } from '@rfcx-bio/common/api-core/classifier/classifier-all'

export const useClassifiers = (apiClient: AxiosInstance): UseQueryReturnType<ClassifierAllResponse | undefined, unknown> => {
  return useQuery(
    ['fetch-classifiers'],
    async () => await apiCoreGetClassifierAll(apiClient)
  )
}
