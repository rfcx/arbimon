import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type Site, type TaxonClass } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type Sync } from '../sync/sync-history'

// Request types
export type ProjectFiltersParams = ProjectRouteParamsSerialized

export type ProjectRecordingCountParams = ProjectRouteParamsSerialized

// Response types
export interface ProjectFiltersResponse {
  locationSites: Site[]
  taxonClasses: TaxonClass[]
  dateStartInclusiveUtc?: string
  dateEndInclusiveUtc?: string
  latestSync?: Sync
}

export interface ProjectRecordingCountResponse {
  count: number
}

// Route
export const projectFiltersRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/filters`

export const projectRecordingCountRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/recording-count`

// Service
export const apiBioGetProjectFilters = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectFiltersResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/filters`)

export const apiBioGetProjectRecordingCount = async (apiClient: AxiosInstance, projectId: number): Promise<number | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/recording-count`)
