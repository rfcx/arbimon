import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request type
export interface DetectSummaryParams {
  jobId: string // string of number
}

// Response type
export interface SpeciesDetectionSummary {
  speciesSlug: string
  speciesName: string
  numberOfDetections: number
}

export interface SpeciesValidationSummary {
  0: number
  1: number
  2: number
  3: number
}

export interface DetectSummaryResponse {
  validationSummary: SpeciesValidationSummary
  speciesSummary: SpeciesDetectionSummary[]
}

// Route
export const detectSummaryRoute = '/jobs/:jobId/detect/summary'

// Service
export const apiBioGetDetectSummaryData = async (apiClient: AxiosInstance, jobId: number): Promise<DetectSummaryResponse | undefined> => {
  return await apiGetOrUndefined(apiClient, `/jobs/${jobId}/detect/summary`)
}
