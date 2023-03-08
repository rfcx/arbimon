import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request type
export type DetectRecordingParams = ProjectRouteParamsSerialized
export interface DetectRecordingQueryParams {
  dateStartLocal: string
  dateEndLocal: string
  querySites?: string
  queryHours?: string
}

// Response type
export interface DetectRecordingResponse {
  totalDurationInMinutes: number
}

// Route
export const detectRecordingRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/detect-recording`

// Service
export const apiBioGetDetectRecordingData = async (apiClient: AxiosInstance, projectId: string, params: DetectRecordingQueryParams): Promise<DetectRecordingResponse | undefined> => {
  return await apiGetOrUndefined(apiClient, `/projects/${projectId}/detect-recording`, { params })
}
