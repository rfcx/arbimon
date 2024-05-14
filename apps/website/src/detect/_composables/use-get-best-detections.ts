import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type GetBestDetectionsQueryParams, type GetBestDetectionsResponse, apiBioGetBestDetections } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { type WithTotalCount } from '@rfcx-bio/common/total-count'

export const useGetBestDetections = (apiClient: AxiosInstance, jobId: number, params: ComputedRef<GetBestDetectionsQueryParams>, refetchInterval: ComputedRef<number | false>, enabled: ComputedRef<boolean>): UseQueryReturnType<WithTotalCount<GetBestDetectionsResponse> | undefined, unknown> => {
  return useQuery({
    queryKey: ['get-best-detections'],
    queryFn: async () => await apiBioGetBestDetections(apiClient, jobId, params.value),
    refetchInterval,
    enabled
  })
}
