import { type Dayjs } from 'dayjs'

import { type CLASSIFIER_JOB_LABELS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

export interface JobInput {
  sites: string
  dateRange: string
  timeOfDay: string
}

export interface JobProgress {
  status: typeof CLASSIFIER_JOB_LABELS[keyof typeof CLASSIFIER_JOB_LABELS]
  value: number
}

export interface Job {
  id: number
  modelName: string
  input: JobInput
  progress: JobProgress
  totalDurationMinutes: number
  createdAt: Dayjs
}

export interface JobFilterItem {
  value: string
  label: string
  checked: boolean
}
