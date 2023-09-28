import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DashboardContentResponse, apiBioGetDashboardContent } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'

export const useGetDashboardContent = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<DashboardContentResponse, unknown> => {
  return useQuery({
    queryKey: ['get-dashboard-content'],
    queryFn: async () => await apiBioGetDashboardContent(apiClient, projectId)
  })
}
