import { type AxiosInstance } from 'axios'

import { type DetectRouteParamsSerialized, DETECT_SPECIFIC_ROUTE_PREFIX, detectSpecificRoutePrefix } from '../_helpers/detect-specific-route'
import { type ReviewStatus } from './detect-detections'

// Request body
export interface DetectReviewDetectionBody {
  status: Exclude<ReviewStatus, 'unreviewed'>
  classification: string
  streamId: string
  classifier: number
  /**
   * ISO 8601 timestamp string
   */
  start: string
}

export type DetectReviewDetectionParams = DetectRouteParamsSerialized

// Response type
export type DetectReviewDetectionResponse = string

// Route
export const detectReviewDetectionRoute = `${DETECT_SPECIFIC_ROUTE_PREFIX}/review-detection`

// Service
export const apiBioDetectReviewDetection = async (apiClient: AxiosInstance, jobId: number, data: DetectReviewDetectionBody): Promise<DetectReviewDetectionResponse> => {
  const response = await apiClient.post<DetectReviewDetectionResponse>(`${detectSpecificRoutePrefix(jobId)}/review-detection`, data)
  return response.data
}
