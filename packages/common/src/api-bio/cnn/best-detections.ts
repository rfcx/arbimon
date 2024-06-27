import { type AxiosInstance } from 'axios'

import { type WithTotalCount, formatTotalCount } from '../../total-count'
import { type Detection, type GetDetectionsQueryParams } from './detections'

// Request types
export type GetBestDetectionsQueryParams = Partial<Pick<GetDetectionsQueryParams, 'start' | 'end' | 'sites' | 'reviewStatus' | 'limit' | 'offset'>> & { nPerChunk?: number, byDate?: boolean, classifications?: string[] }

export interface GetBestDetectionsParams {
  jobId: string
}

// Response types
/**
 * Best detection object type response from core API.
 *
 * Note for frontend team: you have to check on the response object on what key is returned back,
 * then sort the output data based on that returned key. Those 4 keys we're talking about are
 * - `streamRanking`
 * - `streamDailyRanking`
 * - `streamClassificationRanking`
 * - `streamClassificationDailyRanking`
 */
export type BestDetection = Pick<Detection, 'id' | 'siteIdCore' | 'start' | 'end' | 'confidence' | 'classifierId' | 'reviewStatus' | 'classification'> & {
  streamRanking?: number
  streamDailyRanking?: number
  streamClassificationRanking?: number
  streamClassificationDailyRanking?: number
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
