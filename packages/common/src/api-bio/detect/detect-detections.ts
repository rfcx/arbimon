import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { SpeciesDetection } from './types'

// Request type
export interface DetectDetectionQueryParams {
  siteIds?: string[]
  statusId?: string
  classifierId?: string
  confidence?: string
}

export interface DetectDetectionParams {
  jobId: string
}

// Response type
export interface DetectDetectionResponse {
  detections: SpeciesDetection[]
}

// Route
export const detectDetectionRoute = '/jobs/:jobId/detections'

// Service
export const apiBioGetDetectDetections = async (apiClient: AxiosInstance, jobId: number, params: DetectDetectionQueryParams): Promise<string | undefined> =>
  await apiGetOrUndefined(apiClient, `/jobs/${jobId}/detections`, { params })
