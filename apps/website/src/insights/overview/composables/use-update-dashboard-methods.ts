import { type AxiosInstance } from 'axios'
import { type UseMutationReturnType, useMutation } from 'vue-query'

import { type UpdateDashboardContentResponse, apiBioUpdateDashboardContent } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'

export const useUpdateDashboardMethods = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<UpdateDashboardContentResponse, unknown, string, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-dashboard-methods'],
    mutationFn: async (value) => {
      return await apiBioUpdateDashboardContent(apiClient, projectId, 'methods', value)
    }
  })
}