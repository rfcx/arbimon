import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiBioGetDetectSummaryData, DetectionSummaryResponse, DetectSummaryParams, DetectSummaryQueryParams } from '@rfcx-bio/common/api-bio/detect/detect-summary'

export const FETCH_DETECT_SUMMARY = 'fetch-detect-summary'

export const useGetJobSummary = (apiClient: AxiosInstance, project: DetectSummaryParams, params: DetectSummaryQueryParams): UseQueryReturnType<DetectionSummaryResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECT_SUMMARY, params],
    async () => await apiBioGetDetectSummaryData(apiClient, project.projectId, params)
  )
}
