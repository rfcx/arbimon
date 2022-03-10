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
  speciesByTimeHourOfDay: Record<number, number> // hourOfDay -> richness
  speciesByTimeDayOfWeek: Record<number, number> // dayOfWeek -> richness
  speciesByTimeMonthOfYear: Record<number, number> // monthOfYear -> richness
  speciesByTimeUnix: Record<number, number> // unix -> richness
  speciesPresence: Record<number, SpeciesLight>
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
