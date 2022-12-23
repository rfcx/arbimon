import { AxiosInstance } from 'axios'
import { useMutation, UseMutationReturnType } from 'vue-query'

import { apiCoreGetDetections, DetectionResponse } from '@rfcx-bio/common/api-core/detections/list'
import { DetectionQueryParams } from '@rfcx-bio/common/api-core/detections/types'

export const FETCH_DETECTION = 'fetch-detection'

export const useGetDetection = (apiClient: AxiosInstance): UseMutationReturnType<DetectionResponse, unknown, DetectionQueryParams, unknown> => {
  return useMutation(
    ['post-classifier-job'],
    async (params: DetectionQueryParams) => await apiCoreGetDetections(apiClient, params)
  )
}
