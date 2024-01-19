import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { apiBioUpdateProjectPublishStatus } from '@rfcx-bio/common/api-bio/project/project-publish-status'

export const useUpdateInsightsPublishStatus = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseMutationReturnType<void, unknown, boolean, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-insights-publish-status'],
    mutationFn: async (published: boolean) => {
      await apiBioUpdateProjectPublishStatus(apiClient, projectId.value ?? -1, published)
    }
  })
}
