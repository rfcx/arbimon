import { type AxiosInstance } from 'axios'

import { type ClassifierJob } from './classifier-jobs'

export const ARBIMON_CORE_REVIEW_STATUS_MAP = {
  unvalidated: 'unreviewed',
  notPresent: 'rejected',
  unknown: 'uncertain',
  present: 'confirmed'
} as const

export const REVIEW_STATUS_MAPPING = {
  unvalidated: null,
  notPresent: -1,
  unknown: 0,
  present: 1
} as const

export interface ValidationStatus {
  unvalidated: number
  notPresent: number
  unknown: number
  present: number
}

export type CoreRawReviewStatus = typeof REVIEW_STATUS_MAPPING[keyof typeof REVIEW_STATUS_MAPPING]
export type CoreReviewStatus = typeof ARBIMON_CORE_REVIEW_STATUS_MAP[keyof typeof ARBIMON_CORE_REVIEW_STATUS_MAP]
export type ArbimonReviewStatus = keyof typeof ARBIMON_CORE_REVIEW_STATUS_MAP

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
