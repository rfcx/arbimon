import { ColoredFilter } from '~/dataset-filters'

export interface ActivityPatternsData extends ColoredFilter {
  totalRecordingCount: number
  totalSiteCount: number
  detectionCount: number
  detectionFrequency: number
  occupiedSiteCount: number
  occupiedSiteFrequency: number
}
