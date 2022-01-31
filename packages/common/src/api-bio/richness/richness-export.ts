import { MockHourlyDetectionSummary } from '../../mock-data'
import { FilterDatasetQuery } from '../common/filter'

// Request
export interface RichnessByExportParams {
  projectId: string
}

export type RichnessByExportQuery = FilterDatasetQuery

export const richnessByExportRoute = '/projects/:projectId/richness-export'

export const richnessByExportUrl = (params: RichnessByExportParams): string =>
  `/projects/${params.projectId}/richness-export`

// Response
export interface RichnessByExportResponse {
  isLocationRedacted: boolean
  speciesByExport: MockHourlyDetectionSummary[]
}
