import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { apiBioGetClassifiers } from '@rfcx-bio/common/api-bio/classifiers/classifiers'
import { type ClassifierAllResponse } from '@rfcx-bio/common/api-core/classifier/classifier-all'

export const useClassifiers = (apiClient: AxiosInstance): UseQueryReturnType<ClassifierAllResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['fetch-classifiers'],
    queryFn: async () => await apiBioGetClassifiers(apiClient, { limit: 1000, offset: 0 })
  })
}
