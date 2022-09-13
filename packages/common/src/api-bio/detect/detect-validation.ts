import { AxiosInstance } from 'axios'

import { apiPostOrUndefined } from '@rfcx-bio/utils/api'

import { DETECT_SPECIFIC_ROUTE_PREFIX, DetectRouteParamsSerialized, detectSpecificRoutePrefix } from '../_helpers/detect-specific-route'

// Request type
export type DetectValidationParams = DetectRouteParamsSerialized
export interface DetectValidation {
  dateStart: string
  siteId: string
  classificationId: number
  statusId: number
}

// Response type
export interface DetectValidationResponse {
  message: string
}

// Route
export const detectValidationRoute = DETECT_SPECIFIC_ROUTE_PREFIX

// Service
export const apiBioPostDetectValidation = async (apiClient: AxiosInstance, jobId: number, payload: DetectValidation[]): Promise<string | undefined> =>
  await apiPostOrUndefined(apiClient, detectSpecificRoutePrefix(jobId), payload, { headers: { 'Content-Type': 'application/json' } })
