import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type UpdateDashboardContentResponse, apiBioUpdateDashboardContent } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'

export const useUpdateDashboardKeyResult = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<UpdateDashboardContentResponse, unknown, string, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-dashboard-key-result'],
    mutationFn: async (value: string) => {
      return await apiBioUpdateDashboardContent(apiClient, projectId, 'keyResult', value)
    }
  })
}
