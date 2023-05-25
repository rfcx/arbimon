import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request type
export interface DetectCnnDetectionsQueryParams {
  start: string
  end: string
  streams: string[]
  classifications: string[]
  classifiers: number[]
  classifierJobs: number[]
  minConfidence: number
  review_statuses: Array<'rejected' | 'uncertain' | 'confirmed' | 'unreviewed'>
  limit: number
  offset: number
  descending: boolean
  fields: string[]
}

// Response type
export type DetectCnnDetectionsResponse = Array<{
  id: string
  stream_id: string
  start: string
  end: string
  confidence: number
  review_status: null | 'rejected' | 'uncertain' | 'confirmed'
}>

// Route
export const detectCnnDetectionsRoute = '/detections'

// Service
export const apiBioGetDetectCnnDetections = async (apiClient: AxiosInstance, params: DetectCnnDetectionsQueryParams): Promise<DetectCnnDetectionsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, '/detections', { params })
