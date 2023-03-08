import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type DetectRouteParamsSerialized, DETECT_SPECIFIC_ROUTE_PREFIX, detectSpecificRoutePrefix } from '../_helpers/detect-specific-route'

// Request type
export type DetectValidationStatusParams = DetectRouteParamsSerialized

// Response type
export interface DetectValidationStatusResponse {
  0: number
  1: number
  2: number
  3: number
}

// Route
export const detectValidationStatusRoute = `${DETECT_SPECIFIC_ROUTE_PREFIX}/status`

// Service
export const apiBioGetValidationStatusData = async (apiClient: AxiosInstance, jobId: number): Promise<DetectValidationStatusResponse | undefined> => {
  return await apiGetOrUndefined(apiClient, detectSpecificRoutePrefix(jobId) + '/status')
}
