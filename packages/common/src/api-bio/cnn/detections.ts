import { type AxiosInstance } from 'axios'

import { type CLASSIFICATION_STATUS_CORE_ARBIMON_MAP } from './classifier-job-information'

// Request types
export interface GetDetectionsQueryParams {
  start: string
  end: string
  reviewStatus?: typeof CLASSIFICATION_STATUS_CORE_ARBIMON_MAP[keyof typeof CLASSIFICATION_STATUS_CORE_ARBIMON_MAP]
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
  reviewStatus: typeof CLASSIFICATION_STATUS_CORE_ARBIMON_MAP[keyof typeof CLASSIFICATION_STATUS_CORE_ARBIMON_MAP]
}

export type GetDetectionsResponse = Detection[]

// Route
export const getDetectionsRoute = '/detections'

// Service
export const apiBioGetDetections = async (apiClient: AxiosInstance, params: GetDetectionsQueryParams): Promise<GetDetectionsResponse> => {
  const response = await apiClient.get(getDetectionsRoute, { params })
  return response.data
}
