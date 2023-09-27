import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectProfileParams = ProjectRouteParamsSerialized

export interface ProjectProfileUpdateBody {
  summary?: string
  readme?: string
}

// Response types
export interface ProjectProfileResponse {
  summary: string
  readme: string
}

// Route
export const projectProfileRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/profile`

// Service
export const apiBioGetProjectProfileData = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectProfileResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/profile`)
