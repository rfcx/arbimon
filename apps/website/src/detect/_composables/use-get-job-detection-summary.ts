import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiBioGetDetectSummaryData, DetectSummaryQueryParams, DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'

export const FETCH_DETECT_SUMMARY = 'fetch-detect-summary'

export const useGetJobDetectionSummary = (apiClient: AxiosInstance, jobId: number, params: DetectSummaryQueryParams): UseQueryReturnType<DetectSummaryResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECT_SUMMARY, params],
    async () => await apiBioGetDetectSummaryData(apiClient, jobId, params)
  )
}
