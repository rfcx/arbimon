// TEMP - Please update this file in both `common` AND `api`
import { Species } from '../../species/types.js'

// Request
export interface DashboardGeneratedParams {
  projectId: string
}

export const dashboardGeneratedRoute = '/:projectId/dashboard-generated'

export const dashboardGeneratedUrl = (params: DashboardGeneratedParams): string =>
  `/${params.projectId}/dashboard-generated` // TODO: Generate automatically from dashboardGeneratedRoute

// Response
export interface DashboardGeneratedResponse {
  detectionCount: number
  siteCount: number
  speciesCount: number
  endangeredSpecies: number
  richness: DashboardRichness[]
  endangered: Species[]
  hilighted: Species[]
}

export interface DashboardRichness {
  taxonClass: string
  speciesNo: number
}
