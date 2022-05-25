import { FilterDatasetQuery } from '../common/filter'
import { ProjectSpecificRouteParams } from '../common/project-specific-route'

// Request
export type RichnessExportParams = ProjectSpecificRouteParams

export type RichnessExportQuery = FilterDatasetQuery

export const richnessExportRoute = '/projects/:projectId/richness-export'

export const richnessExportUrl = (params: RichnessExportParams): string =>
  `/projects/${params.projectId}/richness-export`

// Response
export interface RichnessExportResponse {
  richnessExport: RichnessByExportReportRow[]
}

export interface RichnessByExportReportRow {
  scientificName: string
  commonName?: string
  site: string
  latitude: number
  longitude: number
  altitude: number
  date: string
  year: string
  month: string
  day: string
  hour: string
  countDetectionMinutes: number
}
