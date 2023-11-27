import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type ClassifierJobUpdateStatusParams, apiCorePostClassifierJobUpdateStatus } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-update-status'

export const usePostClassifierJobStatus = (apiClient: AxiosInstance, jobId: number): UseMutationReturnType<void, unknown, ClassifierJobUpdateStatusParams, unknown> => {
  return useMutation({
    mutationKey: ['post-classifier-job-status'],
    mutationFn: async (payload: ClassifierJobUpdateStatusParams) => { await apiCorePostClassifierJobUpdateStatus(apiClient, jobId, payload) }
  })
}
