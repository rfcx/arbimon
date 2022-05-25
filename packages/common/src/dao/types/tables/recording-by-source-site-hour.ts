export interface RecordingBySourceSiteHour {
  timePrecisionHourLocal: Date
  sourceId: number
  projectSiteId: number
  projectId: number
  recordingMinutes: string // number[]
}
