import { type AxiosInstance } from 'axios'

import { type ArbimonReviewStatus, type ValidationStatus } from './classifier-job-information'

// Request types
export interface GetDetectionsSummaryQueryParams {
  start: string
  end: string
  sites?: string[]
  classifierJobId: number
  classification?: string
  confidence?: number
  classifierId: number
  reviewStatus?: ArbimonReviewStatus[]
}

// Response types
export type GetDetectionsSummaryResponse = Omit<ValidationStatus, 'total'>

// Route
export const getDetectionsSummaryRoute = '/detections/summary'

// Service
export const apiBioGetDetectionsSummary = async (apiClient: AxiosInstance, params: GetDetectionsSummaryQueryParams): Promise<GetDetectionsSummaryResponse> => {
  const response = await apiClient.get('/detections/summary', { params })
  return response.data
}
