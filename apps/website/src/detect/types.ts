export interface JobInput {
  sites: string
  dateRange: string
  timeOfDay: string
}

export interface JobProgress {
  status: number
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
