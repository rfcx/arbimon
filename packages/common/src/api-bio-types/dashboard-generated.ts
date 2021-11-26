// TEMP - Please update this file in both `common` AND `api`

// Request
export interface DashboardGeneratedParams {
  projectId: string
}

export const dashboardGeneratedRoute = '/:projectId/dashboard-generated'

export const dashboardUrl = (params: DashboardGeneratedParams): string =>
  `/${params.projectId}/dashboard-generated` // TODO: Generate automatically from dashboardGeneratedRoute

// Response
export interface DashboardGeneratedResponse {
  metrics: DashboardGeneratedResponseMetrics
}

export interface DashboardGeneratedResponseMetrics {
  detectionCount: number
  siteCount: number
  speciesCount: number
  endangeredSpecies: number
}
