import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type LocationProjectProfile, type Project } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type ProjectProfileUpdateBody } from './project-profile'

// Request types
export type ProjectSettingsParams = ProjectRouteParamsSerialized

// Response types
export type ProjectSettingsUpdateBody = ProjectProfileUpdateBody & { name?: string }
export type ProjectSettingsResponse = Pick<Project, 'name'> & Pick<LocationProjectProfile, 'summary' | 'objectives'>

// Route
export const projectSettingsRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/settings`

// Service
export const apiBioGetProjectSettingsData = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectSettingsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}/settings`)

export const apiBioUpdateProjectSettingsData = async (apiClient: AxiosInstance, projectId: number, settings: ProjectSettingsUpdateBody): Promise<ProjectSettingsResponse> =>
  await apiClient.patch(`/projects/${projectId}/settings`, settings)
