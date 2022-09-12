import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request type
export interface DetectSummaryParams {
  jobId: string // string of number
}

export interface DetectSummaryQueryParams {
  limit?: string // string of number
  offset?: string // string of number
}

// Response type
export interface SpeciesDetectionSummary {
  speciesSlug: string
  speciesName: string
  numberOfDetections: number
}

export interface DetectSummaryResponse {
  total: number
  currentPage: number
  results: SpeciesDetectionSummary[]
}

// Route
export const detectSummaryRoute = '/jobs/:jobId/detect/summary'

// Service
export const apiBioGetDetectSummaryData = async (apiClient: AxiosInstance, jobId: number, params: DetectSummaryQueryParams): Promise<DetectSummaryResponse | undefined> => {
  return await apiGetOrUndefined(apiClient, `/jobs/${jobId}/detect/summary`, { params })
}
