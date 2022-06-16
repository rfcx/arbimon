import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiCoreGetClassifierAll, ClassifierAllResponse } from '@rfcx-bio/common/api-core/classifier/classifier-all'

export const useClassifiers = (apiClient: AxiosInstance): UseQueryReturnType<ClassifierAllResponse | undefined, unknown> => {
  return useQuery(
    ['fetch-classifiers'],
    async () => await apiCoreGetClassifierAll(apiClient)
  )
}
