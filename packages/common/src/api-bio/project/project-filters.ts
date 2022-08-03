import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { Site, TaxonClass } from '../../dao/types'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'
import { Sync } from '../sync/sync-history'

// Request types
export type ProjectFiltersParams = ProjectRouteParamsSerialized

// Response types
export interface ProjectFiltersResponse {
  locationSites: Site[]
  taxonClasses: TaxonClass[]
  dateStartInclusiveUtc?: string
  dateEndInclusiveUtc?: string
  latestSync?: Sync
}

// Route
export const projectFiltersRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/filters`

// Service
export const apiBioGetProjectFilters = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectFiltersResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/filters`)
