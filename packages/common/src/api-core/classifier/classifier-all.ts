import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request types
export interface ClassifierAllParams {
  limit?: number
  offset?: number
}

// Response types
export type ClassifierAllResponse = Classifier[]

export interface Classifier {
  id: number
  name: string
  version: number
  last_executed_at: string
}

// Service
export const apiCoreGetClassifierAll = async (apiClient: AxiosInstance, params: ClassifierAllParams = {}): Promise<ClassifierAllResponse | undefined> =>
  await apiGetOrUndefined(apiClient, '/classifiers', { params })
