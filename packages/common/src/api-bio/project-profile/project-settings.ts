import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type LocationProjectCountry, type LocationProjectProfile, type Project, type ProjectVersion } from '../../dao/types'
import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type ProjectProfileUpdateBody } from './project-profile'

// Request types
export type ProjectSettingsParams = ProjectRouteParamsSerialized

// Response types
export type ProjectSettingsUpdateBody = ProjectProfileUpdateBody & { name: string } // name is required as part of checking for permission in Core
export type ProjectSettingsResponse = Pick<Project, 'name'>
  & Pick<LocationProjectProfile, 'summary' | 'objectives' | 'dateStart' | 'dateEnd'>
  & Pick<LocationProjectCountry, 'countryCodes'>
  & Pick<ProjectVersion, 'isPublished'>

// Route
export const projectDataRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}`

// Service
export const apiBioGetProjectSettingsData = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectSettingsResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${projectId}`)

export const apiBioUpdateProjectSettingsData = async (apiClient: AxiosInstance, projectId: number, settings: ProjectSettingsUpdateBody): Promise<ProjectSettingsResponse> =>
  await apiClient.patch(`/projects/${projectId}/settings`, settings)
