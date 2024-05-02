import { type AxiosInstance } from 'axios'

import { type GetClassifierJobInformationResponse } from './classifier-job-information'

// Request types
export interface GetClassifierJobInfoByClassificationParams {
  jobId: string
  classificationValue: string
}

// Response types
export interface GetClassifierJobInfoByClassificationResponse {
  title: string
  total: number
  streams: GetClassifierJobInformationResponse['streams']
}

// Route
export const getClassifierJobInfoByClassificationRoute = '/jobs/:jobId/classifications/:classificationValue'

// Service
export const apiBioGetClassifierJobInfoByClassification = async (apiClient: AxiosInstance, jobId: number, classificationValue: string): Promise<GetClassifierJobInfoByClassificationResponse> => {
  const response = await apiClient.get(`/jobs/${jobId}/classifications/${classificationValue}`)
  return response.data
}
