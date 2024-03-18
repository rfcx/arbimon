import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type GetClassifierJobInformationResponse, apiBioGetClassifierJobInformation } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type DetectSummaryQueryParams, type DetectSummaryResponse, apiBioGetDetectSummaryData } from '@rfcx-bio/common/api-bio/detect/detect-summary'

export const FETCH_DETECT_SUMMARY = 'fetch-detect-summary'

export const useGetJobDetectionSummary = (apiClient: AxiosInstance, jobId: number, params: DetectSummaryQueryParams, options: { refetchInterval: number | false } = { refetchInterval: 30_000 }): UseQueryReturnType<DetectSummaryResponse | undefined, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECT_SUMMARY],
    queryFn: async () => await apiBioGetDetectSummaryData(apiClient, jobId, params),
    // refetch every 30 seconds
    refetchInterval: options.refetchInterval
  })
}

export const useGetClassifierJobInformation = (apiClient: AxiosInstance, jobId: number, options: { refetchInterval: number | false } = { refetchInterval: 30_000 }): UseQueryReturnType<GetClassifierJobInformationResponse | undefined, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECT_SUMMARY],
    queryFn: async () => await apiBioGetClassifierJobInformation(apiClient, jobId)

    // refetch every 30 seconds
    // refetchInterval: options.refetchInterval
  })
}
