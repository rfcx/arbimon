import { ProjectSpecificRouteParams } from '../_helpers'
import { FilterDatasetQuery } from '../common/filter'

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
  name: string
  site: string
  latitude: number
  longitude: number
  day: string
  month: string
  year: string
  date: string
  hour: string
}
