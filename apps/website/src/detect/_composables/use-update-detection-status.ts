import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type UpdateDetectionStatusBody, apiBioUpdateDetectionStatus } from '@rfcx-bio/common/api-bio/cnn/reviews'

export const useUpdateDetectionStatus = (apiClient: AxiosInstance): UseMutationReturnType<void, unknown, UpdateDetectionStatusBody, unknown> => {
  return useMutation({
    mutationKey: ['post-detection-status'],
    mutationFn: async (payload: UpdateDetectionStatusBody) => { await apiBioUpdateDetectionStatus(apiClient, payload) }
  })
}
