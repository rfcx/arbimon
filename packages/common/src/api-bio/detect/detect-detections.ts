import { type AxiosInstance } from 'axios'

import { type DetectRouteParamsSerialized, DETECT_SPECIFIC_ROUTE_PREFIX, detectSpecificRoutePrefix } from '../_helpers/detect-specific-route'

export const REVIEW_STATUS_MAPPING = {
  rejected: -1,
  uncertain: 0,
  confirmed: 1,
  unreviewed: null
} as const

export type ReviewStatus = keyof typeof REVIEW_STATUS_MAPPING

// Request type
export interface DetectDetectionsQueryParams {
  start: string
  end: string
  // streams concept for core
  sites?: string[]
  // what kind of species
  classifications?: string[]
  // models used
  classifiers?: number[]
  // min confidence
  minConfidence?: number
  reviewStatuses?: ReviewStatus[]
  limit?: number
  offset?: number
  descending?: boolean
  fields?: string[]
}

export type DetectDetectionsParams = DetectRouteParamsSerialized

// Response type
export type DetectDetectionsResponse = Array<{
  id: string
  siteId: string
  classifierId: number
  start: string
  end: string
  confidence: number
  reviewStatus: ReviewStatus
  classification: {
    value: string
    title: string
    image: string | null
  }
}>

// Route
export const detectDetectionsRoute = `${DETECT_SPECIFIC_ROUTE_PREFIX}/detections`

// Service
export const apiBioGetDetectDetections = async (apiClient: AxiosInstance, jobId: number, params: DetectDetectionsQueryParams): Promise<DetectDetectionsResponse> => {
  const response = await apiClient.get(`${detectSpecificRoutePrefix(jobId)}/detections`, {
    params
  })

  return response.data
}
