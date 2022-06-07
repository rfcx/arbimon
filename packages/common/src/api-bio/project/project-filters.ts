import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { DataSource, Site, TaxonClass } from '../../dao/types'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type ProjectFiltersParams = ProjectRouteParamsSerialized

// Response types
export interface ProjectFiltersResponse {
  locationSites: Site[]
  taxonClasses: TaxonClass[]
  dateStartInclusiveUtc?: string
  dateEndInclusiveUtc?: string
  updatedList: DataSource[]
}

// Route
export const projectFiltersRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/filters`

// Service
export const getProjectFilters = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectFiltersResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/filters`)
