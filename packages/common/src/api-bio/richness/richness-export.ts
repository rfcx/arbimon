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
  speciesByExport: RichnessByExportReport[]
}

export interface RichnessByExportReport {
  species: string
  site: string
  latitude: number
  longitude: number
  day: string
  month: string
  year: string
  date: string
  hour: number
}
