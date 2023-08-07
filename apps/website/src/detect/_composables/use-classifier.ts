import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type ClassifierParams, type ClassifierQueryParams, type ClassifierResponse, apiBioGetClassifier } from '@rfcx-bio/common/api-bio/classifiers/classifier'

export const useClassifier = (apiClient: AxiosInstance, params: ComputedRef<ClassifierParams>, query: ClassifierQueryParams): UseQueryReturnType<ClassifierResponse | undefined, unknown> => {
  return useQuery(
    ['fetch-classifier', params],
    async () => await apiBioGetClassifier(apiClient, params.value, query)
  )
}
