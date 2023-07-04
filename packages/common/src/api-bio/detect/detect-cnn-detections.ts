import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

export type ReviewStatus = 'rejected' | 'uncertain' | 'confirmed' | 'unreviewed'

// Request type
export interface DetectCnnDetectionsQueryParams {
  start: string
  end: string
  // site concept for core
  streams?: string[]
  // what kind of species
  classifications?: string[]
  // models used
  classifiers?: number[]
  // which job to look for
  classifier_jobs: number[]
  // min confidence
  min_confidence?: number
  review_statuses?: ReviewStatus[]
  limit?: number
  offset?: number
  descending?: boolean
  fields?: string[]
}

// Response type
export type DetectCnnDetectionsResponse = Array<{
  id: string
  stream_id: string
  classifier_id: number
  start: string
  end: string
  confidence: number
  review_status: Exclude<ReviewStatus, 'unreviewed'> | null
  classification: {
    value: string
    title: string
    image: string | null
  }
}>

// Route
export const detectCnnDetectionsRoute = '/detections'

// Service
export const apiBioGetDetectCnnDetections = async (apiClient: AxiosInstance, params: DetectCnnDetectionsQueryParams): Promise<DetectCnnDetectionsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, '/detections', { params })
