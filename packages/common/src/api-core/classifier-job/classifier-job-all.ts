import { AxiosInstance } from 'axios'

// Request types
export interface ClassifierJobAllParams {
  limit?: number
  offset?: number
}

// Response types
export type ClassifierJobAllResponse = ClassifierJobAll

export interface ClassifierJobAll {
  total: number
  items: ClassifierJob[]
}

export interface ClassifierJob {
  id: number
  classifier_id: number
  project_id: string
  query_streams: string
  query_start: string
  query_end: string
  query_hours: string
  minutes_total: number
  minutes_completed: number
  status: number
  created_by_id: number
  created_at: string
  updated_at: string
  started_at: string
  completed_at: string
}

// Service
export const apiCoreGetClassifierJobAll = async (apiClient: AxiosInstance, params: ClassifierJobAllParams = {}): Promise<ClassifierJobAllResponse> => {
  const res = await apiClient.get('/classifier-jobs', { params })

  const result: ClassifierJobAll = {
    total: res.headers?.['total-items'] ? Number(res.headers['total-items']) : 0,
    items: res.data
  }
  return result
}
