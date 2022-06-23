import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { ProjectSite, TaxonClass } from '../../dao/types'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers/project-specific-route'

// Request types
export type ProjectFiltersParams = ProjectRouteParamsSerialized

// Response types
export interface ProjectFiltersResponse {
  locationSites: ProjectSite[]
  taxonClasses: TaxonClass[]
  dateStartInclusiveUtc?: string
  dateEndInclusiveUtc?: string
}

// Route
export const projectFiltersRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/filters`

// Service
export const apiBioGetProjectFilters = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectFiltersResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/filters`)
