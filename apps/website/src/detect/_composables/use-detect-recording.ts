import { AxiosInstance } from 'axios'
import { useQuery, UseQueryReturnType } from 'vue-query'

import { apiBioGetDetectRecordingData, DetectRecordingParams, DetectRecordingQueryParams, DetectRecordingResponse } from '@rfcx-bio/common/api-bio/detect/detect-recording'

export const FETCH_DETECT_RECORDINGS = 'fetch-detect-recordings'

export const useDetectRecording = (apiClient: AxiosInstance, project: DetectRecordingParams, params: DetectRecordingQueryParams): UseQueryReturnType<DetectRecordingResponse | undefined, unknown> => {
  return useQuery(
    [FETCH_DETECT_RECORDINGS, params],
    async () => await apiBioGetDetectRecordingData(apiClient, project.projectId, params)
  )
}
