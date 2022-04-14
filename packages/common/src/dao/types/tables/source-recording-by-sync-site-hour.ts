export interface SourceRecordingBySyncSiteHour {
  timePrecisionHourLocal: Date
  sourceSyncId: number
  projectSiteId: number
  recordingMinutes: number[]
  durationMinutes: number
}
