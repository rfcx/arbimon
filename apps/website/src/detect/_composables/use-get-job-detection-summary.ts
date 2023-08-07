import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DetectSummaryQueryParams, type DetectSummaryResponse, apiBioGetDetectSummaryData } from '@rfcx-bio/common/api-bio/detect/detect-summary'

export const FETCH_DETECT_SUMMARY = 'fetch-detect-summary'

export const useGetJobDetectionSummary = (apiClient: AxiosInstance, jobId: number, params: DetectSummaryQueryParams, options: { refetchInterval: number | false } = { refetchInterval: 30_000 }): UseQueryReturnType<DetectSummaryResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECT_SUMMARY],
    async () => await apiBioGetDetectSummaryData(apiClient, jobId, params),
    {
      // refetch every 30 seconds
      refetchInterval: options.refetchInterval
    }
  )
}
