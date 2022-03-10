import { FilterDatasetQuery } from '../common/filter'
import { SpeciesLight } from '../species/types'

// Request
export interface RichnessDatasetParams {
  projectId: string
}

export type RichnessDatasetQuery = FilterDatasetQuery

export const richnessDatasetRoute = '/projects/:projectId/richness'

export const richnessDatasetUrl = (params: RichnessDatasetParams): string =>
  `/projects/${params.projectId}/richness`

// Response
export interface RichnessDatasetResponse {
  isLocationRedacted: boolean
  richnessByTaxon: Record<number, number> // taxonClassId -> richness
  richnessBySite: RichnessSiteData[]
  richnessByTimeHourOfDay: Record<number, number> // hourOfDay -> richness
  richnessByTimeDayOfWeek: Record<number, number> // dayOfWeek -> richness
  richnessByTimeMonthOfYear: Record<number, number> // monthOfYear -> richness
  richnessByTimeUnix: Record<number, number> // unix -> richness
  richnessPresence: Record<number, SpeciesLight>
}

export interface RichnessSiteData {
  locationSiteId: number
  taxonClassId: number
  richness: number
}

export interface SpeciesByExportReportRow {
  species: string
  site: string
  latitude: number
  longitude: number
  day: string
  month: string
  year: string
  date: string
  hour: string
}
