import { ExtinctionRiskCode } from '../../iucn'
import { ApiLine, ApiMap, ApiStack } from '../_helpers'

// Request
export interface DashboardGeneratedParams {
  projectId: string
}

export const dashboardGeneratedRoute = '/:projectId/dashboard-generated'

export const dashboardGeneratedUrl = (params: DashboardGeneratedParams): string =>
  `/${params.projectId}/dashboard-generated` // TODO: Generate automatically from dashboardGeneratedRoute

// Response
export interface DashboardSpecies {
  speciesId: number
  speciesSlug: string
  scientificName: string
  commonName: string
  extinctionRisk: ExtinctionRiskCode
  taxon: string
  thumbnailImageUrl?: string
}

export interface DashboardGeneratedResponse {
  // Metrics
  detectionCount: number
  siteCount: number
  speciesCount: number
  speciesThreatenedCount: number

  // Species
  speciesThreatened: DashboardSpecies[]
  speciesHighlighted: DashboardSpecies[]

  // Charts & maps
  richnessByExtinction: ApiStack
  richnessByHour: ApiLine
  richnessBySite: ApiMap
  richnessByTaxon: ApiStack
  detectionFrequencyByHour: ApiLine
  detectionFrequencyBySite: ApiMap
}
