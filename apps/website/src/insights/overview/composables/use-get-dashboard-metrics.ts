import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DashboardMetricsResponse, apiBioGetDashboardMetrics } from '@rfcx-bio/common/api-bio/dashboard/dashboard-metrics'

export const useGetDashboardMetrics = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<DashboardMetricsResponse, unknown> => {
  return useQuery({
    queryKey: ['get-dashboard-metrics', projectId],
    queryFn: async () => await apiBioGetDashboardMetrics(apiClient, projectId?.value ?? -1)
  })
}
