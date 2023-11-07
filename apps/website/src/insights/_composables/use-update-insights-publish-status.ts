import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseMutationReturnType, useMutation } from 'vue-query'

import { apiBioUpdateInsightsPublishStatus } from '@rfcx-bio/common/api-bio/insights-publish-status/insights-publish-status'

export const useUpdateInsightsPublishStatus = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseMutationReturnType<void, unknown, boolean, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-insights-publish-status'],
    mutationFn: async (status: boolean) => {
      await apiBioUpdateInsightsPublishStatus(apiClient, projectId.value ?? -1, status)
    }
  })
}
