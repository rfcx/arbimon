import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DashboardStakeholdersResponse, apiBioGetDashboardStakeholders } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'

export const useGetDashboardStakeholders = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<DashboardStakeholdersResponse, unknown> => {
  return useQuery({
    queryKey: ['get-dashboard-stakeholders'],
    queryFn: async () => await apiBioGetDashboardStakeholders(apiClient, projectId)
  })
}
