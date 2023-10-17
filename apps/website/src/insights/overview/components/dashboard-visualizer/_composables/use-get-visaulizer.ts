import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DashboardDataByHourResponse, apiBioGetDashboardDataByHour } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-hour'
import { type DashboardDataBySiteResponse, apiBioGetDashboardDataBySite } from '@rfcx-bio/common/api-bio/dashboard/dashboard-data-by-site'

export const useGetDashboardDataBySite = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<DashboardDataBySiteResponse, unknown> => {
  return useQuery({
    queryKey: ['get-dashboard-data-by-site', projectId],
    queryFn: async () => await apiBioGetDashboardDataBySite(apiClient, projectId?.value ?? -1)
  })
}

export const useGetDashboardDataByTime = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<DashboardDataByHourResponse, unknown> => {
  return useQuery({
    queryKey: ['get-dashboard-data-by-time', projectId],
    queryFn: async () => await apiBioGetDashboardDataByHour(apiClient, projectId?.value ?? -1)
  })
}
