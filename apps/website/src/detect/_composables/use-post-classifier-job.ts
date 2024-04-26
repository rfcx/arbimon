import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type CreateClassifierJobBody, apiBioCreateClassifierJob } from '@rfcx-bio/common/api-bio/cnn/create-classifier-job'

export const usePostClassifierJob = (apiClient: AxiosInstance): UseMutationReturnType<string, unknown, CreateClassifierJobBody, unknown> => {
  return useMutation({
    mutationKey: ['post-classifier-job'],
    mutationFn: async (payload: CreateClassifierJobBody) => await apiBioCreateClassifierJob(apiClient, payload)
  })
}
