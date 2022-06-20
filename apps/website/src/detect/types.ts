export interface JobInput {
  sites: string
  dateRange: string
  timeOfDay: string
}

export interface JobProgress {
  status: string
  value: number
}

export interface Job {
  id: number
  modelName: string
  input: JobInput
  progress: JobProgress
  numberOfRecordings: number
  createdAt: Date
}

export interface JobFilterItem {
  value: string
  label: string
  checked: boolean
}
