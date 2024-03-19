import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type DetectSummaryQueryParams, type DetectSummaryResponse, apiBioGetDetectSummaryData } from '@rfcx-bio/common/api-bio/detect/detect-summary'

export const FETCH_DETECT_SUMMARY = 'fetch-detect-summary'

export const useGetJobDetectionSummary = (apiClient: AxiosInstance, jobId: number, params: DetectSummaryQueryParams, refetchInterval: ComputedRef<number | false>): UseQueryReturnType<DetectSummaryResponse, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECT_SUMMARY, params],
    queryFn: async () => await apiBioGetDetectSummaryData(apiClient, jobId, params),
    refetchInterval
  })
}
