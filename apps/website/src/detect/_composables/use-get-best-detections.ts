import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type GetBestDetectionsQueryParams, type GetBestDetectionsResponse, apiBioGetBestDetections } from '@rfcx-bio/common/api-bio/cnn/best-detections'

export const FETCH_DETECT_SUMMARY = 'fetch-detect-summary'

export const useGetBestDetections = (apiClient: AxiosInstance, jobId: number, params: GetBestDetectionsQueryParams, refetchInterval: ComputedRef<number | false>): UseQueryReturnType<GetBestDetectionsResponse | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-best-detections'],
    queryFn: async () => await apiBioGetBestDetections(apiClient, jobId, params),
    refetchInterval
  })
}