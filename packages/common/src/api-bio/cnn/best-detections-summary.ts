import { type AxiosInstance } from '@/../../utils/node_modules/axios'
import { type GetBestDetectionsQueryParams } from './best-detections'
import { type ValidationStatus } from './classifier-job-information'

// Request types
export type GetBestDetectionsSummaryQueryParams = Omit<GetBestDetectionsQueryParams, 'limit' | 'offset' | 'fields'>

export interface GetBestDetectionsSummaryParams {
  jobId: string
}

// Response types
export type GetBestDetectionsSummaryResponse = Omit<ValidationStatus, 'total'>

// Route
export const getBestDetectionsSummaryRoute = '/jobs/:jobId/best-detections/summary'

// Service
export const apiBioGetBestDetectionsSummary = async (apiClient: AxiosInstance, jobId: number, params: GetBestDetectionsSummaryQueryParams): Promise<GetBestDetectionsSummaryResponse> => {
  const response = await apiClient.get(`/jobs/${jobId}`, { params })
  return response.data
}