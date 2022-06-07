import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'
import { DashboardSpecies } from './common'

// Request types
export type DashboardProfileParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardProfileResponse {
  summary: string
  readme: string // markdown string
  speciesHighlighted: DashboardSpecies[]
}

// Route
export const dashboardProfileRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-profile`

// Service
export const apiBioGetDashboardProfileData = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardProfileResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/dashboard-profile`)
