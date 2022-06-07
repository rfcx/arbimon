import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { ApiLine, ApiMap, ApiStack, PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'
import { DashboardSpecies } from './common'

// Request types
export type DashboardGeneratedParams = ProjectRouteParamsSerialized

// Response types
export interface DashboardGeneratedResponse {
  // Metrics
  detectionCount: number
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
export const dashboardGeneratedUrl = (params: DashboardGeneratedParams): string =>
  `/projects/${params.projectId}/dashboard-generated` // TODO: Generate automatically from dashboardGeneratedRoute

export const getDashboardGeneratedData = async (apiClient: AxiosInstance, projectId: number): Promise<DashboardGeneratedResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/dashboard-generated`)
