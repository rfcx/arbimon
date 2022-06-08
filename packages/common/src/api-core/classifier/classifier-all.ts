import { AxiosInstance } from 'axios'

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
  status: string
  external_id: string
}

// Service
export const apiCoreGetClassifierAll = async (apiClient: AxiosInstance, params: ClassifierAllParams = {}): Promise<ClassifierAllResponse | undefined> =>
  await apiClient.get('/classifiers', { params })
