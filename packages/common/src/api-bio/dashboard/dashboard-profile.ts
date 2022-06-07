import { ProjectSpecificRouteParams } from '../_helpers'
import { DashboardSpecies } from './common'

// Request
export type DashboardProfileParams = ProjectSpecificRouteParams

export const dashboardProfileRoute = '/projects/:projectId/dashboard-profile'

export const dashboardProfileUrl = (params: DashboardProfileParams): string =>
  `/projects/${params.projectId}/dashboard-profile` // TODO: Generate automatically from dashboardProfileRoute

// Response
export interface DashboardProfileResponse {
  summary: string
  readme: string // markdown string
  speciesHighlighted: DashboardSpecies[]
}
