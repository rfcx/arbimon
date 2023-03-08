import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DetectSummaryResponse, apiBioGetDetectSummaryData } from '@rfcx-bio/common/api-bio/detect/detect-summary'

export const FETCH_DETECT_SUMMARY = 'fetch-detect-summary'

export const useGetJobDetectionSummary = (apiClient: AxiosInstance, jobId: number): UseQueryReturnType<DetectSummaryResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECT_SUMMARY],
    async () => await apiBioGetDetectSummaryData(apiClient, jobId)
  )
}
