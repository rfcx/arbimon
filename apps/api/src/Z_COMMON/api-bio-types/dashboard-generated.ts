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
  detectionCount: number
  siteCount: number
  speciesCount: number
  endangeredSpecies: number
  richness: DashboardRichness[]
  endangered: DashboardSpecies[]
  highlighted: DashboardSpecies[]
  speciesRichness: {
    time: Record<number, number>
  }
  detectionFrequency: {
    time: Record<number, number>
  }
}

export interface DashboardRichness {
  taxonClass: string
  speciesNo: number
}

export interface DashboardSpecies {
  speciesId: number
  speciesSlug: string
  speciesName: string
  extinctionRisk: ExtinctionRiskCode
  className: string
  thumbnailImageUrl: string
}
