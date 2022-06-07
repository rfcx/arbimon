import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiCoreGetClassifierAll } from '@rfcx-bio/common/api-core/classifier/classifier-all'

export const useClassifiers = (apiClient: AxiosInstance): UseQueryReturnType<unknown, unknown> => {
  return useQuery(
    ['fetch-classifiers'],
    async () => await apiCoreGetClassifierAll(apiClient)
  )
}
