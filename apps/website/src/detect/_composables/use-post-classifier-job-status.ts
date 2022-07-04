import { AxiosInstance } from 'axios'
import { useMutation, UseMutationReturnType } from 'vue-query'

import { apiCorePostClassifierJobUpdateStatus, ClassifierJobUpdateStatusParams } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-update-status'

export const usePostClassifierJobStatus = (apiClient: AxiosInstance, jobId: number): UseMutationReturnType<void, unknown, ClassifierJobUpdateStatusParams, unknown> => {
  return useMutation(
    ['post-classifier-job-status'],
    async (payload: ClassifierJobUpdateStatusParams) => await apiCorePostClassifierJobUpdateStatus(apiClient, jobId, payload)
  )
}
