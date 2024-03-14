import { type AxiosInstance } from 'axios'

import { type CLASSIFIER_JOB_LABELS } from '../../api-core/classifier-job/classifier-job-status'

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
  status: typeof CLASSIFIER_JOB_LABELS[keyof typeof CLASSIFIER_JOB_LABELS]
  createdById: number
  createdAt: string
  completedAt: string | null
  classifier: {
    id: number
    name: string
    version: number
  }
}

export interface GetClassifierJobsQueryParams {
  project: string
  createdBy?: 'me' | 'all'
}

export type GetClassifierJobsResponse = ClassifierJob[]

export const getClassifierJobsRoute = '/jobs'

export const apiBioGetClassifierJobs = async (apiClientBio: AxiosInstance, projectId: string, createdBy: 'me' | 'all'): Promise<GetClassifierJobsResponse[]> => {
  return await apiClientBio.get(getClassifierJobsRoute, {
    params: new URLSearchParams([['project', projectId.toString()], ['createdBy', createdBy]])
  }).then(res => res.data)
}
