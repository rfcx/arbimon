import { type AxiosInstance } from 'axios'

export const CLASSIFIER_JOB_LABELS = {
  0: 'queued',
  20: 'running',
  30: 'done',
  40: 'error',
  50: 'cancelled',
  60: 'awaiting-cancellation'
} as const

// Response type
export interface ClassifierJob {
  id: number
  classifierId: number
  projectId: string
  queryStreams: string | null
  queryStart: string
  queryEnd: string
  queryHours: string
  minutesTotal: number
  minutesCompleted: number
  status: keyof typeof CLASSIFIER_JOB_LABELS
  createdById: number
  createdAt: string
  completedAt: string | null
  classifier: {
    id: number
    name: string
    version: number
  }
}

export type GetClassifierJobsResponse = ClassifierJob[]

// Request type
export interface GetClassifierJobsQueryParams {
  project: string
  createdBy?: 'me' | 'all'
}

// Route
export const getClassifierJobsRoute = '/jobs'

// Service
export const apiBioGetClassifierJobs = async (apiClientBio: AxiosInstance, projectId: string, createdBy: 'me' | 'all'): Promise<GetClassifierJobsResponse[]> => {
  return await apiClientBio.get(getClassifierJobsRoute, {
    params: new URLSearchParams([['project', projectId.toString()], ['createdBy', createdBy]])
  }).then(res => res.data)
}
