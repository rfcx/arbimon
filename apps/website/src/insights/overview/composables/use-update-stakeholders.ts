import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type UpdateDashboardStakeholdersRequestBody, apiBioUpdateDashboardStakeholders } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

export const useUpdateDashboardStakeholders = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<void, unknown, UpdateDashboardStakeholdersRequestBody, unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-dashboard-stakeholder'],
    mutationFn: async (value) => {
      await apiBioUpdateDashboardStakeholders(apiClient, projectId, value)
    }
  })
}
