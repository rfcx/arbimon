import { type AxiosInstance } from 'axios'

import { type ArbimonReviewStatus } from './classifier-job-information'

// Request types
export interface GetDetectionsQueryParams {
  start: string
  end: string
  reviewStatus?: ArbimonReviewStatus
  /* Core site Ids */
  sites?: string[]
  classifierJobId: number
  /* the `value` field of the classification e.g. `calironensis_cabaris_simple_song_1` */
  classification?: string
  confidence?: number
  classifierId: number
  limit?: number
  offset?: number
}

// Response types
export interface Detection {
  id: number
  /* Core siteId */
  siteIdCore: string
  start: string
  end: string
  classifierId: number
  confidence: number
  reviewStatus: ArbimonReviewStatus
  classification: {
    title: string
    value: string
    image: string | null
  }
}

export type GetDetectionsResponse = Detection[]

// Route
export const getDetectionsRoute = '/detections'

// Service
export const apiBioGetDetections = async (apiClient: AxiosInstance, params: GetDetectionsQueryParams): Promise<GetDetectionsResponse> => {
  const response = await apiClient.get(getDetectionsRoute, { params })
  return response.data
}
