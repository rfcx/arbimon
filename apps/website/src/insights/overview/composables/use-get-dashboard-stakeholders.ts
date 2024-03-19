import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type DashboardStakeholdersResponse, apiBioGetDashboardStakeholders } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

export const useGetDashboardStakeholders = (apiClient: AxiosInstance, projectId: number, enabled: ComputedRef<boolean>): UseQueryReturnType<DashboardStakeholdersResponse, unknown> => {
  return useQuery({
    queryKey: ['get-dashboard-stakeholders'],
    queryFn: async () => await apiBioGetDashboardStakeholders(apiClient, projectId),
    enabled
  })
}
