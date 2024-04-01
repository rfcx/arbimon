import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type GetDetectionsQueryParams, type GetDetectionsResponse, apiBioGetDetections } from '@rfcx-bio/common/api-bio/cnn/detections'

export const FETCH_DETECTIONS = 'fetch-detections'

export const useGetJobDetections = (apiClient: AxiosInstance, params: ComputedRef<GetDetectionsQueryParams>, enabled: ComputedRef<boolean>, refetchInterval: ComputedRef<number | false>): UseQueryReturnType<GetDetectionsResponse, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECTIONS, params],
    queryFn: async () => await apiBioGetDetections(apiClient, params.value),
    enabled,
    refetchInterval
  })
}
