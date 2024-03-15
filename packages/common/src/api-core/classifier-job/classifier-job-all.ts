import { type AxiosInstance } from 'axios'

import { type ClassifierJobStatusNumber } from './classifier-job-status'

// Request types
export interface ClassifierJobAllParams {
  created_by?: string
  status?: number
  projects?: string[]
  limit?: number
  offset?: number
}

// Response types
export type ClassifierJobAllResponse = ClassifierJobResponse[]

export interface ClassifierJobResponse {
  id: number
  classifier: Classifier
  classifierId: number
  projectId: string
  queryStreams: string | null
  queryStart: string | null
  queryEnd: string | null
  queryHours: string | null
  minutesTotal: number
  minutesCompleted: number
  status: ClassifierJobStatusNumber
  createdById: number
  createdAt: string
  updatedAt: string
  startedAt: string
  completedAt: string
}

export interface ClassifierJobInput {
  sites: string
  dateRange: string
  timeOfDay: string
}

export interface ClassifierJobProgress {
  status: number
  value: number
}

export interface ClassifierJob {
  id: number
  modelName: string
  input: ClassifierJobInput
  progress: ClassifierJobProgress
  totalDurationMinutes: number
  createdAt: Date
}

interface Classifier {
  id: number
  name: string
}

// Wrapper types
export interface ClassifierJobAll {
  total: number
  items: ClassifierJobResponse[]
}

// Service

/**
 * @deprecated please use [`apiBioGetClassifierJobs`] instead. The function resides in `src/api-bio/cnn/classifier-jobs.ts`
 */
export const apiCoreGetClassifierJobAll = async (apiClient: AxiosInstance, params: ClassifierJobAllParams = {}): Promise<ClassifierJobAll> => {
  const res = await apiClient.get<ClassifierJobAllResponse>('/classifier-jobs', { params })
  if (!Array.isArray(res.data)) return { total: 0, items: [] }

  const result: ClassifierJobAll = {
    total: res.headers?.['total-items'] ? Number(res.headers['total-items']) : 0,
    items: res.data
  }
  return result
}
