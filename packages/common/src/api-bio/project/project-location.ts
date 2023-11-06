import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectLocationParams = ProjectRouteParamsSerialized

// Response types
export interface ProjectLocationResponse {
  country: string[] | null
  code: string[] | null
}

// Route
export const projectLocationRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/project-location`

// Service
export const apiBioGetProjectLocation = async (apiClient: AxiosInstance, locationProjectId: number): Promise<ProjectLocationResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${locationProjectId}/project-location`)
