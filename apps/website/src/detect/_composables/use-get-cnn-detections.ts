import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DetectCnnDetectionsQueryParams, type DetectCnnDetectionsResponse, apiBioGetDetectCnnDetections } from '@rfcx-bio/common/api-bio/detect/detect-cnn-detections'

export const FETCH_DETECTIONS = 'fetch-detections'

export const useGetJobDetections = (apiClient: AxiosInstance, params: DetectCnnDetectionsQueryParams): UseQueryReturnType<DetectCnnDetectionsResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECTIONS],
    async () => await apiBioGetDetectCnnDetections(apiClient, params)
  )
}
