// TEMP - Please update this file in both `common` AND `api`

// Request
export interface DashboardProfileParams {
  projectId: string
}

export const dashboardProfileRoute = '/:projectId/dashboard-profile'

export const dashboardProfileUrl = (params: DashboardProfileParams): string =>
  `/${params.projectId}/dashboard-profile` // TODO: Generate automatically from dashboardGeneratedRoute

// Response
export interface DashboardProfileResponse {
  description: string
  readme: string // markdown string
}
