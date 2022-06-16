import { AxiosInstance } from 'axios'

// Request types
export interface ClassifierJobAllParams {
  limit?: number
  offset?: number
}

// Response types
export type ClassifierJobAllResponse = ClassifierJob[]

export interface ClassifierJob {
  id: number
  classifier: Classifier
  classifierId: number
  projectId: string
  queryStreams: string
  queryStart: string
  queryEnd: string
  queryHours: string
  minutesTotal: number
  minutesCompleted: number
  status: number
  created_by_id: number
  created_at: string
  updated_at: string
  started_at: string
  completed_at: string
}

interface Classifier {
  id: number
  name: string
}

// Wrapper types
export interface ClassifierJobAll {
  total: number
  items: ClassifierJob[]
}

// Service
export const apiCoreGetClassifierJobAll = async (apiClient: AxiosInstance, params: ClassifierJobAllParams = {}): Promise<ClassifierJobAll> => {
  const res = await apiClient.get<ClassifierJobAllResponse>('/classifier-jobs', { params })
  if (!Array.isArray(res.data)) return { total: 0, items: [] }

  const result: ClassifierJobAll = {
    total: res.headers?.['total-items'] ? Number(res.headers['total-items']) : 0,
    items: res.data
  }
  return result
}
