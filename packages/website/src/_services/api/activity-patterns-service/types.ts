import { DatasetDefinition } from '..'

export interface ActivityPatternsData extends DatasetDefinition {
  totalRecordingCount: number
  totalSiteCount: number
  detectionCount: number
  detectionFrequency: number
  occupiedSiteCount: number
  occupiedSiteFrequency: number
}
