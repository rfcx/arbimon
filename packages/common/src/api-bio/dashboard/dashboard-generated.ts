import { ApiLine, ApiMap, ApiStack } from '../_helpers'
import { DashboardSpecies } from './common'

// Request
export interface DashboardGeneratedParams {
  projectId: string
}

export const dashboardGeneratedRoute = '/projects/:projectId/dashboard-generated'

export const dashboardGeneratedUrl = (params: DashboardGeneratedParams): string =>
  `/projects/${params.projectId}/dashboard-generated` // TODO: Generate automatically from dashboardGeneratedRoute

// Response
export interface DashboardGeneratedResponse {
  // Metrics
  detectionCount: number
  siteCount: number
  speciesCount: number
  speciesThreatenedCount: number

  // Species
  speciesThreatened: DashboardSpecies[]

  // Charts & maps
  richnessByExtinction: ApiStack
  richnessByHour: ApiLine
  richnessBySite: ApiMap
  richnessByTaxon: ApiStack
  detectionByHour: ApiLine
  detectionBySite: ApiMap
}
