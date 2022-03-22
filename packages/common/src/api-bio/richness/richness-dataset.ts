import { ProjectSpecificRouteParams } from '@/api-bio/common/project-specific-route'
import { FilterDatasetQuery } from '../common/filter'

// Request
export type RichnessDatasetParams = ProjectSpecificRouteParams

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
  richnessPresence: Record<number, RichnessPresence>
  richnessExport: RichnessByExportReportRow[]
}

export interface RichnessSiteData {
  locationSiteId: number
  taxonClassId: number
  richness: number
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

export interface RichnessPresence {
  taxonClassId: number
  taxonSpeciesId: number
  taxonSpeciesSlug: string
  commonName: string
  scientificName: string
}
