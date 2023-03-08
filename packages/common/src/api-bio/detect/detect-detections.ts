import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type DetectRouteParamsSerialized } from '../_helpers/detect-specific-route'
import { type SpeciesDetection } from './types'

// Request type
export type DetectDetectionParams = DetectRouteParamsSerialized
export interface DetectDetectionQueryParams {
  siteIds?: string[]
  statusId?: string
  classifierId?: string
  confidence?: string
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
