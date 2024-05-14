import { type AxiosInstance } from 'axios'

import { type GetClassifierJobInformationResponse } from './classifier-job-information'
import { type CLASSIFIER_JOB_LABELS } from './classifier-jobs'

// Request types
export interface GetClassifierJobInfoByClassificationParams {
  jobId: string
  classificationValue: string
}

// Response types
export interface GetClassifierJobInfoByClassificationResponse {
  title: string
  total: number
  classifierId: number
  status: keyof typeof CLASSIFIER_JOB_LABELS
  streams: GetClassifierJobInformationResponse['streams']
  queryStart: string
  queryEnd: string
}

// Route
export const getClassifierJobInfoByClassificationRoute = '/jobs/:jobId/classifications/:classificationValue'

// Service
export const apiBioGetClassifierJobInfoByClassification = async (apiClient: AxiosInstance, jobId: number, classificationValue: string): Promise<GetClassifierJobInfoByClassificationResponse> => {
  const response = await apiClient.get(`/jobs/${jobId}/classifications/${classificationValue}`)
  return response.data
}
