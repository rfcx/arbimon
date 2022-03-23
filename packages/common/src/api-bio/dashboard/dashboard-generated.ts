import { ApiLine, ApiMap, ApiStack } from '../_helpers'
import { ProjectSpecificRouteParams } from '../common/project-specific-route'
import { DashboardSpecies } from './common'

// Request
export type DashboardGeneratedParams = ProjectSpecificRouteParams

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
  maxDate?: Date
  minDate?: Date

  // Species
  speciesThreatened: DashboardSpecies[]

  // Charts & maps
  richnessByTaxon: ApiStack
  richnessByRisk: ApiStack
  richnessBySite: ApiMap
  detectionBySite: ApiMap
  richnessByHour: ApiLine
  detectionByHour: ApiLine
}
