import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DashboardContentResponse, apiBioGetDashboardContent } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'

export const useGetDashboardContent = (apiClient: AxiosInstance, projectId: number, enabled: ComputedRef<boolean>): UseQueryReturnType<DashboardContentResponse, unknown> => {
  return useQuery({
    queryKey: ['get-dashboard-content'],
    queryFn: async () => await apiBioGetDashboardContent(apiClient, projectId),
    enabled
  })
}
