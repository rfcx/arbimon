import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type ClassifierAllResponse, apiCoreGetClassifierAll } from '@rfcx-bio/common/api-core/classifier/classifier-all'

export const useClassifiers = (apiClient: AxiosInstance): UseQueryReturnType<ClassifierAllResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-classifiers'],
    queryFn: async () => await apiCoreGetClassifierAll(apiClient)
  })
}
