import { type AxiosInstance } from 'axios'

import { type ArbimonReviewStatus, ARBIMON_CORE_REVIEW_STATUS_MAP } from './classifier-job-information'

// Request types
export interface UpdateDetectionStatusBody {
  jobId: number
  siteIdCore: string
  start: string
  status: ArbimonReviewStatus
  classificationValue: string
  classifierId: number
}

export const validReviewStatus = Object.keys(ARBIMON_CORE_REVIEW_STATUS_MAP)

// Response types
export type UpdateDetectionStatusResponseBody = Array<{ id: number, status: ArbimonReviewStatus }>

// Route
export const updateDetectionStatusRoute = '/detections/review'

// Service
export const apiBioUpdateDetectionStatus = async (apiClient: AxiosInstance, body: UpdateDetectionStatusBody): Promise<UpdateDetectionStatusResponseBody> => {
  console.info('VALIDATION: post-detection-status', body.status, body.start)
  const response = await apiClient.post(updateDetectionStatusRoute, body)
  return response.data
}
