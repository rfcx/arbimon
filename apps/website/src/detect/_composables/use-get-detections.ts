import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DetectDetectionsQueryParams, type DetectDetectionsResponse, apiBioGetDetectDetections } from '@rfcx-bio/common/api-bio/detect/detect-detections'

export const FETCH_DETECTIONS = 'fetch-detections'

export const useGetJobDetections = (apiClient: AxiosInstance, jobId: number, params: ComputedRef<DetectDetectionsQueryParams>): UseQueryReturnType<DetectDetectionsResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECTIONS, params],
    async () => await apiBioGetDetectDetections(apiClient, jobId, params.value)
  )
}
