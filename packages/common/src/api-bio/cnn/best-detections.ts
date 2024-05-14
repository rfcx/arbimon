import { type AxiosInstance } from 'axios'

import { type WithTotalCount, formatTotalCount } from '../../total-count'
import { type Detection, type GetDetectionsQueryParams } from './detections'

// Request types
export type GetBestDetectionsQueryParams = Partial<Pick<GetDetectionsQueryParams, 'start' | 'end' | 'sites' | 'reviewStatus' | 'limit' | 'offset'>> & { nPerStream?: number, byDate?: boolean }

export interface GetBestDetectionsParams {
  jobId: string
}

// Response types
export type BestDetection = Pick<Detection, 'id' | 'siteIdCore' | 'start' | 'end' | 'confidence' | 'classifierId' | 'reviewStatus' | 'classification'> & {
  dailyRanking: number
  streamRanking: number
}

export type GetBestDetectionsResponse = BestDetection[]

export const xTotalBestDetectionsCountHeaderName = 'x-total-best-detections-count'

// Route
export const getBestDetectionsRoute = '/jobs/:jobId/best-detections'

// Service
export const apiBioGetBestDetections = async (apiClient: AxiosInstance, jobId: number, params: GetBestDetectionsQueryParams): Promise<WithTotalCount<GetBestDetectionsResponse>> => {
  const response = await apiClient.get(`/jobs/${jobId}/best-detections`, {
    params
  })
  return {
    total: formatTotalCount(response.headers?.[xTotalBestDetectionsCountHeaderName]),
    data: response.data
  }
}
