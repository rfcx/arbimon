import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ApiStack, type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type DashboardSpecies } from './common'

// Request types
export type DashboardSpeciesDataParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardSpeciesDataResponse {
  speciesHighlighted: DashboardSpecies[]
  speciesThreatened: DashboardSpecies[]
  richnessByTaxon: ApiStack
  richnessByRisk: ApiStack
}

// Route
export const dashboardSpeciesDataRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-species-data`

// Service
export const apiBioGetDashboardSpeciesDataRoute = async (apiClient: AxiosInstance, params: ProjectRouteParamsSerialized): Promise<DashboardSpeciesDataResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${params.projectId}/dashboard-species-data`)
