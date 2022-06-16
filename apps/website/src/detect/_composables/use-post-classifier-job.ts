import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiCorePostClassifierJobCreate, ClassifierJobCreateParams, ClassifierJobCreateResponse } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-create'

export const usePostClassifierJob = (apiClient: AxiosInstance, payload: ClassifierJobCreateParams): UseQueryReturnType<ClassifierJobCreateResponse | undefined, unknown> => {
  return useQuery(
    ['post-classifier-job'],
    async () => await apiCorePostClassifierJobCreate(apiClient, payload)
  )
}
