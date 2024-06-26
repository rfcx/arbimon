import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type DetectRecordingParams, type DetectRecordingQueryParams, type DetectRecordingResponse, apiBioGetDetectRecordingData } from '@rfcx-bio/common/api-bio/detect/detect-recording'

export const FETCH_DETECT_RECORDINGS = 'fetch-detect-recordings'

export const useDetectRecording = (apiClient: AxiosInstance, project: DetectRecordingParams, params: DetectRecordingQueryParams): UseQueryReturnType<DetectRecordingResponse | undefined, unknown> => {
  return useQuery({
    queryKey: [FETCH_DETECT_RECORDINGS, params],
    queryFn: async () => await apiBioGetDetectRecordingData(apiClient, project.projectId, params)
  })
}
