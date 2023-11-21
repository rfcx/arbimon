import { type AxiosInstance } from 'axios'
import { type UseMutationReturnType, useMutation } from 'vue-query'

import { type UpdateDashboardStakeholderOrganizationsResponseBody, apiBioUpdateDashboardStakeholderOrganizations } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

export const useUpdateStakeholdersOrganizationsList = (apiClient: AxiosInstance, projectId: number): UseMutationReturnType<UpdateDashboardStakeholderOrganizationsResponseBody, unknown, number[], unknown, unknown> => {
  return useMutation({
    mutationKey: ['update-dashboard-stakeholder-organizations'],
    mutationFn: async (value) => {
      return await apiBioUpdateDashboardStakeholderOrganizations(apiClient, projectId, value)
    }
  })
}
