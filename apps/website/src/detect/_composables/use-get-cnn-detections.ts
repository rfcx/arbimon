import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DetectSummaryResponse, apiBioGetDetectSummaryData } from '@rfcx-bio/common/api-bio/detect/detect-summary'

export const FETCH_DETECTIONS = 'fetch-detections'

export const useGetJobDetections = (apiClient: AxiosInstance, jobId: number): UseQueryReturnType<DetectSummaryResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECTIONS],
    async () => await apiBioGetDetections(apiClient, jobId)
  )
}
