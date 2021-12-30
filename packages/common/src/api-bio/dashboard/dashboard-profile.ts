import { DashboardSpecies } from './common'

// Request
export interface DashboardProfileParams {
  projectId: string
}

export const dashboardProfileRoute = '/:projectId/dashboard-profile'

export const dashboardProfileUrl = (params: DashboardProfileParams): string =>
  `/${params.projectId}/dashboard-profile` // TODO: Generate automatically from dashboardProfileRoute

// Response
export interface DashboardProfileResponse {
  description: string
  readme: string // markdown string
  speciesHighlighted: DashboardSpecies[]
}
