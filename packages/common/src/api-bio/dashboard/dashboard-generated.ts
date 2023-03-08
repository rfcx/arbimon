import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ApiLine, type ApiMap, type ApiStack, type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type DashboardSpecies } from './common'

// Request types
export type DashboardGeneratedParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardGeneratedResponse {
  // Metrics
  detectionMinutesCount: number
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

// Route
export const dashboardGeneratedRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/dashboard-generated`

// Service
export const apiBioGetDashboardGeneratedData = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardGeneratedResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/dashboard-generated`)
