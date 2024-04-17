import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type UpdateClassifierJobBody, apiBioUpdateClassifierJob } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

export const usePostClassifierJobStatus = (apiClient: AxiosInstance, jobId: number): UseMutationReturnType<void, unknown, UpdateClassifierJobBody, unknown> => {
  return useMutation({
    mutationKey: ['post-classifier-job-status'],
    mutationFn: async (payload: UpdateClassifierJobBody) => { await apiBioUpdateClassifierJob(apiClient, jobId, payload) }
  })
}
