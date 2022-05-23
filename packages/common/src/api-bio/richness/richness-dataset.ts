import { FilterDatasetQuery } from '../common/filter'
import { ProjectSpecificRouteParams } from '../common/project-specific-route'

// Request
export type RichnessDatasetParams = ProjectSpecificRouteParams

export type RichnessDatasetQuery = FilterDatasetQuery

export const richnessDatasetRoute = '/projects/:projectId/richness'

export const richnessDatasetUrl = (params: RichnessDatasetParams): string =>
  `/projects/${params.projectId}/richness`

// Response
export interface RichnessDatasetResponse {
  isLocationRedacted: boolean
  richnessBySite: RichnessSiteData[]
  richnessByTaxon: Record<number, number> // taxonClassId -> richness
  richnessByTimeHourOfDay: Record<number, number> // hourOfDay -> richness
  richnessByTimeDayOfWeek: Record<number, number> // dayOfWeek -> richness
  richnessByTimeMonthOfYear: Record<number, number> // monthOfYear -> richness
  richnessByTimeUnix: Record<number, number> // unix -> richness
  detectedSpecies: Record<number, DetectedSpecies>
}

export interface RichnessSiteData {
  locationSiteId: number
  taxonClassId: number
  richness: number
}

export interface DetectedSpecies {
  taxonClassId: number
  taxonSpeciesId: number
  taxonSpeciesSlug: string
  commonName: string
  scientificName: string
}
