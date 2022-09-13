import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DETECT_SPECIFIC_ROUTE_PREFIX, DetectRouteParamsSerialized, detectSpecificRoutePrefix } from '../_helpers/detect-specific-route'

// Request type
export type DetectSummaryParams = DetectRouteParamsSerialized

// Response type
export interface SpeciesDetectionSummary {
  classificationId: number
  classificationName: string
  numberOfDetections: number
}

export interface DetectSummaryResponse {
  speciesSummary: SpeciesDetectionSummary[]
}

// Route
export const detectSummaryRoute = `${DETECT_SPECIFIC_ROUTE_PREFIX}/summary`

// Service
export const apiBioGetDetectSummaryData = async (apiClient: AxiosInstance, jobId: number): Promise<DetectSummaryResponse | undefined> => {
  return await apiGetOrUndefined(apiClient, detectSpecificRoutePrefix(jobId) + '/summary')
}
