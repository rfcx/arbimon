import { type UseQueryDefinedReturnType, type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type GetClassifierJobInfoByClassificationResponse, apiBioGetClassifierJobInfoByClassification } from '@rfcx-bio/common/api-bio/cnn/classifier-job-classification'
import { type GetDetectionsQueryParams, type GetDetectionsResponse, apiBioGetDetections } from '@rfcx-bio/common/api-bio/cnn/detections'
import { type GetDetectionsSummaryQueryParams, type GetDetectionsSummaryResponse, apiBioGetDetectionsSummary } from '@rfcx-bio/common/api-bio/cnn/detections-summary'
import { type WithTotalCount } from '@rfcx-bio/common/total-count'

export const FETCH_DETECTIONS = 'fetch-detections'
export const FETCH_DETECTIONS_SUMMARY = 'fetch-detections-summary'
export const FETCH_CLASSIFIER_JOB_INFO = 'fetch-classifier-job-info'

export const useGetJobDetections = (apiClient: AxiosInstance, params: ComputedRef<GetDetectionsQueryParams>, enabled: ComputedRef<boolean>, refetchInterval: ComputedRef<number | false>): UseQueryDefinedReturnType<WithTotalCount<GetDetectionsResponse>, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECTIONS, params],
    initialData: { total: 0, data: [] },
    queryFn: async () => await apiBioGetDetections(apiClient, params.value),
    enabled,
    refetchInterval
  })
}

export const useGetDetectionsSummary = (apiClient: AxiosInstance, params: ComputedRef<GetDetectionsSummaryQueryParams>, enabled: ComputedRef<boolean>, refetchInterval: ComputedRef<number | false>): UseQueryReturnType<GetDetectionsSummaryResponse, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECTIONS_SUMMARY, params],
    queryFn: async () => await apiBioGetDetectionsSummary(apiClient, params.value),
    enabled,
    refetchInterval
  })
}

export const useGetClassifierJobInfo = (apiClient: AxiosInstance, jobId: number, classifier: string): UseQueryReturnType<GetClassifierJobInfoByClassificationResponse, unknown> => {
  return useQuery({
    queryKey: [FETCH_CLASSIFIER_JOB_INFO],
    queryFn: async () => await apiBioGetClassifierJobInfoByClassification(apiClient, jobId, classifier)
  })
}
