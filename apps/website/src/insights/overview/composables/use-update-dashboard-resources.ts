import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type UpdateDashboardContentResponse, apiBioUpdateDashboardContent } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'

export const useUpdateDashboardResources = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<UpdateDashboardContentResponse, unknown, string, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-dashboard-resources'],
    mutationFn: async (value) => {
      return await apiBioUpdateDashboardContent(apiClient, projectId, 'resources', value)
    }
  })
}
