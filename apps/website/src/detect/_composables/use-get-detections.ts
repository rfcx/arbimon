import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DetectDetectionsQueryParams, type DetectDetectionsResponse, apiBioGetDetectDetections } from '@rfcx-bio/common/api-bio/detect/detect-detections'

export const FETCH_DETECTIONS = 'fetch-detections'

export const useGetJobDetections = (apiClient: AxiosInstance, jobId: number, params: ComputedRef<DetectDetectionsQueryParams>, enabled: ComputedRef<boolean>): UseQueryReturnType<DetectDetectionsResponse | undefined, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECTIONS, params],
    queryFn: async () => await apiBioGetDetectDetections(apiClient, jobId, params.value),
    enabled,
    // the job detections will refetch intervally every 30 seconds all the time.
    // because there could be new detections review data coming in from other users,
    // not just the incoming detections data.
    refetchInterval: 30_000
  })
}
