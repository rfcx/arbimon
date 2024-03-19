import { type AxiosInstance } from 'axios'

import { type ClassifierJob } from './classifier-jobs'

export interface ValidationStatus {
  unvalidated: number
  present: number
  notPresent: number
  unknown: number
}

export const REVIEW_STATUS_MAPPING = {
  unreviewed: null,
  rejected: -1,
  uncertain: 0,
  confirmed: 1
} as const

export const CLASSIFICATION_STATUS_CORE_ARBIMON_MAP = {
  unreviewed: 'unvalidated',
  rejected: 'notPresent',
  uncertain: 'unknown',
  confirmed: 'present'
} as const

// Response type
export interface GetClassifierJobInformationResponse extends ClassifierJob {
  streams: Array<{ id: string, name: string }>
  validationStatus: ValidationStatus
  totalDistinctClassifications: number
}

// Request type
export interface GetClassifierJobInformationParams {
  jobId: string
}

// Route
export const getClassifierJobInformationRoute = '/jobs/:jobId'

// Service
export const apiBioGetClassifierJobInformation = async (apiClient: AxiosInstance, jobId: number): Promise<GetClassifierJobInformationResponse> => {
  const response = await apiClient.get(`/jobs/${jobId}`)
  return response.data
}
