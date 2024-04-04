import { type AxiosInstance } from 'axios'

import { type CLASSIFIER_JOB_LABELS, type ClassifierJob } from './classifier-jobs'

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
  total: number
  unvalidated: number
  notPresent: number
  unknown: number
  present: number
}

export type CoreRawReviewStatus = typeof REVIEW_STATUS_MAPPING[keyof typeof REVIEW_STATUS_MAPPING]
export type CoreReviewStatus = typeof ARBIMON_CORE_REVIEW_STATUS_MAP[keyof typeof ARBIMON_CORE_REVIEW_STATUS_MAP]
export type ArbimonReviewStatus = keyof typeof ARBIMON_CORE_REVIEW_STATUS_MAP

export type EligibleUpdateClassifierJobStatus = Exclude<keyof typeof CLASSIFIER_JOB_LABELS, 20 | 60>

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

export type UpdateClassifierJobStatusParams = GetClassifierJobInformationParams

export interface UpdateClassifierJobStatusBody {
  status: EligibleUpdateClassifierJobStatus
}

// Route
export const getClassifierJobInformationRoute = '/jobs/:jobId'
export const updateClassifierJobStatusRoute = getClassifierJobInformationRoute

// Service
export const apiBioGetClassifierJobInformation = async (apiClient: AxiosInstance, jobId: number): Promise<GetClassifierJobInformationResponse> => {
  const response = await apiClient.get(`/jobs/${jobId}`)
  return response.data
}

export const apiBioUpdateClassifierJobStatus = async (apiClient: AxiosInstance, jobId: number, status: EligibleUpdateClassifierJobStatus): Promise<void> => {
  await apiClient.patch(`/jobs/${jobId}`, {
    status
  })
}
