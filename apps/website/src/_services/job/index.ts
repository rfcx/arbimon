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
  id: string
  modelName: string
  input: JobInput
  progress: JobProgress
  numberOfRecordings: number
  createdAt: Date
}
