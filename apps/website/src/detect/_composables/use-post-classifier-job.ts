import { AxiosInstance } from 'axios'
import { useMutation, UseMutationReturnType } from 'vue-query'

import { apiCorePostClassifierJobCreate, ClassifierJobCreateParams, ClassifierJobCreateResponse } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-create'

export const usePostClassifierJob = (apiClient: AxiosInstance): UseMutationReturnType<ClassifierJobCreateResponse, unknown, ClassifierJobCreateParams, unknown> => {
  return useMutation(
    ['post-classifier-job'],
    async (payload: ClassifierJobCreateParams) => await apiCorePostClassifierJobCreate(apiClient, payload)
  )
}
