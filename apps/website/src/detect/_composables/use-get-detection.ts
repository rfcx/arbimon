import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { ClassifierJobResponse } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-all'
import { apiCoreGetDetections, DetectionResponse } from '@rfcx-bio/common/api-core/detections/list'
import { DetectionQueryParams } from '@rfcx-bio/common/api-core/detections/types'

export const FETCH_DETECTION = 'fetch-detection'

// Convert front params to api params
const convertClassifierJobToDetectionQueryParams = (params: ClassifierJobResponse): DetectionQueryParams => {
  const { queryStart, queryEnd, queryStreams, classifierId } = params
  return {
    start: queryStart,
    end: queryEnd,
    streams: queryStreams ? [queryStreams] : null,
    classifiers: [classifierId.toString()]
  }
}

export const useGetDetection = (apiClient: AxiosInstance, params: ClassifierJobResponse): UseQueryReturnType<DetectionResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECTION],
    async () => await apiCoreGetDetections(apiClient, convertClassifierJobToDetectionQueryParams(params))
  )
}
