import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type ClassifierParams, type ClassifierQueryParams, type ClassifierResponse, apiBioGetClassifier } from '@rfcx-bio/common/api-bio/classifiers/classifier'

export const useClassifier = (apiClient: AxiosInstance, params: ComputedRef<ClassifierParams>, query: ClassifierQueryParams, enabled: ComputedRef<boolean>): UseQueryReturnType<ClassifierResponse, unknown> => {
  return useQuery({
    queryKey: ['fetch-classifier', params],
    queryFn: async () => await apiBioGetClassifier(apiClient, params.value, query),
    enabled
  })
}
