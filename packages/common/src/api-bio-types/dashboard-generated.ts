import { ExtinctionRiskCode } from '../iucn'

// Request
export interface DashboardGeneratedParams {
  projectId: string
}

export const dashboardGeneratedRoute = '/:projectId/dashboard-generated'

export const dashboardGeneratedUrl = (params: DashboardGeneratedParams): string =>
  `/${params.projectId}/dashboard-generated` // TODO: Generate automatically from dashboardGeneratedRoute

// Response
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
  richnessByTaxon: Record<string, number>
  richnessByHour: Record<number, number>
  detectionFrequencyByHour: Record<number, number>
}

export interface DashboardSpecies {
  speciesId: number
  speciesSlug: string
  scientificName: string
  commonName: string
  extinctionRisk: ExtinctionRiskCode
  taxon: string
  thumbnailImageUrl?: string
}
