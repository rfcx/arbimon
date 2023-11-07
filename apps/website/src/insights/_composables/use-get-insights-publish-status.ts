import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type GetInsightsPublishStatusResponseBody, apiBioGetInsightsPublishStatus } from '@rfcx-bio/common/api-bio/insights-publish-status/insights-publish-status'

export const useGetInsightsPublishStatus = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<GetInsightsPublishStatusResponseBody, unknown> => {
  return useQuery({
    queryKey: ['get-insights-publish-status'],
    queryFn: async () => {
      return await apiBioGetInsightsPublishStatus(apiClient, projectId.value ?? -1)
    }
  })
}
