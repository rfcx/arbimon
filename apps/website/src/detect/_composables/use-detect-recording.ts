import { type AxiosInstance } from 'axios'
import { type UseQueryReturnType, useQuery } from 'vue-query'

import { type DetectRecordingParams, type DetectRecordingQueryParams, type DetectRecordingResponse, apiBioGetDetectRecordingData } from '@rfcx-bio/common/api-bio/detect/detect-recording'

export const FETCH_DETECT_RECORDINGS = 'fetch-detect-recordings'

export const useDetectRecording = (apiClient: AxiosInstance, project: DetectRecordingParams, params: DetectRecordingQueryParams): UseQueryReturnType<DetectRecordingResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECT_RECORDINGS, params],
    async () => await apiBioGetDetectRecordingData(apiClient, project.projectId, params)
  )
}
