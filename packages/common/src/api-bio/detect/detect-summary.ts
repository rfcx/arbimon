import { type AxiosInstance } from 'axios'

import { type ClassifierJobStatusNumber } from '../../api-core/classifier-job/classifier-job-status'
import { type DetectRouteParamsSerialized, DETECT_SPECIFIC_ROUTE_PREFIX, detectSpecificRoutePrefix } from '../_helpers/detect-specific-route'

// Request type
export type DetectSummaryParams = DetectRouteParamsSerialized

export interface DetectSummaryQueryParams {
  fields?: string[]
}

// Response type
export interface DetectSummaryResponse {
  id: number
  classifierId: number
  projectId: number
  queryStreams: string | null
  queryStart: string
  queryEnd: string
  queryHours: string
  minutesTotal: number
  minutesCompleted: number | null
  status: ClassifierJobStatusNumber
  createdAt: number
  completedAt: string | null
  classifier: {
    id: number
    name: string
    version: number
  }
  streams: Array<{
    id: string
    name: string
  }>
}

// Route
export const detectSummaryRoute = `${DETECT_SPECIFIC_ROUTE_PREFIX}/summary`

// Service
// Make the api throws so vue-query can catch when it errors
export const apiBioGetDetectSummaryData = async (apiClient: AxiosInstance, jobId: number, query: DetectSummaryQueryParams): Promise<DetectSummaryResponse> => {
  const response = await apiClient.get(detectSpecificRoutePrefix(jobId) + '/summary', { params: query })
  return response.data
}
