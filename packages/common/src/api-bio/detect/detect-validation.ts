import { AxiosInstance } from 'axios'

import { apiPostOrUndefined } from '@rfcx-bio/utils/api'

// Request type
export interface DetectValidation {
  dateStart: string
  siteId: string
  classificationId: number
  statusId: number
}

export interface DetectValidationParams {
  jobId: string
}

// Response type
export interface DetectValidationResponse {
  message: string
}

// Route
export const detectValidationRoute = '/jobs/:jobId/detections'

// Service
export const apiBioPostDetectValidation = async (apiClient: AxiosInstance, jobId: number, payload: DetectValidation[]): Promise<string | undefined> =>
  await apiPostOrUndefined(apiClient, `/jobs/${jobId}/detections`, payload, { headers: { 'Content-Type': 'application/json' } })
