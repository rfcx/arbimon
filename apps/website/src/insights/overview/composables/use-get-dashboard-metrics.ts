import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DashboardMetricsResponse, apiBioGetDashboardMetrics } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'

export const useGetDashboardMetrics = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<DashboardMetricsResponse, unknown> => {
  return useQuery({
    queryKey: ['get-dashboard-metrics'],
    queryFn: async () => await apiBioGetDashboardMetrics(apiClient, projectId)
  })
}
