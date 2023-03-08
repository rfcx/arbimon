import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type DashboardSpecies } from './common'

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
