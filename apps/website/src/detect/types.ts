import { type ClassifierJobStatusNumber } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

export interface JobInput {
  sites: string
  dateRange: string
  timeOfDay: string
}

export interface JobProgress {
  status: ClassifierJobStatusNumber
  value: number
}

export interface Job {
  id: number
  modelName: string
  input: JobInput
  progress: JobProgress
  totalDurationMinutes: number
  createdAt: Date
}

export interface JobFilterItem {
  value: string
  label: string
  checked: boolean
}
