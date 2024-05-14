import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type GetBestDetectionsQueryParams, type GetBestDetectionsResponse, apiBioGetBestDetections } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { type GetBestDetectionsSummaryResponse, type GetBestDetectionsSummaryQueryParams, apiBioGetBestDetectionsSummary } from '@rfcx-bio/common/api-bio/cnn/best-detections-summary'
import { type WithTotalCount } from '@rfcx-bio/common/total-count'

export const useGetBestDetections = (apiClient: AxiosInstance, jobId: number, params: ComputedRef<GetBestDetectionsQueryParams>, refetchInterval: ComputedRef<number | false>, enabled: ComputedRef<boolean>): UseQueryReturnType<WithTotalCount<GetBestDetectionsResponse> | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-best-detections'],
    queryFn: async () => await apiBioGetBestDetections(apiClient, jobId, params.value),
    refetchInterval,
    enabled
  })
}

export const useGetBestDetectionsSummary = (apiClient: AxiosInstance, jobId: number, params: ComputedRef<GetBestDetectionsSummaryQueryParams>, enabled: ComputedRef<boolean>): UseQueryReturnType<GetBestDetectionsSummaryResponse, unknown> => {
  return useQuery({
    queryKey: ['get-best-detections-summary'],
    queryFn: async () => await apiBioGetBestDetectionsSummary(apiClient, jobId, params.value),
    enabled
  })
}
