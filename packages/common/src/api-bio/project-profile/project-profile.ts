import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type LocationProjectProfile } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectProfileParams = ProjectRouteParamsSerialized

export interface ProjectProfileUpdateBody {
  summary?: string
  objectives?: string[]
  dateStart?: string
  dateEnd?: string | null
}

// Response types
export type ProjectProfileResponse = Pick<LocationProjectProfile, 'summary' | 'objectives'>

// Route
export const projectProfileRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/profile`

// Service
export const apiBioGetProjectProfileData = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectProfileResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/profile`)

export const apiBioUpdateProjectProfileData = async (apiClient: AxiosInstance, projectId: number, projectProfile: ProjectProfileUpdateBody): Promise<ProjectProfileResponse | undefined> =>
  await apiClient.patch(`/projects/${projectId}/profile`, projectProfile)
