import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectRecordingCountParams = ProjectRouteParamsSerialized

// Response types
export interface SitesRecCountAndDates {
  id: number
  recordings: number
  days: number
}

export interface ProjectRecordingCountResponse {
  count: number
}

// Route
export const projectSitesRecordingCountRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/sites-recording-count`

// Service
export const apiBioGetProjectRecordingCountBySite = async (apiClient: AxiosInstance, projectId: number): Promise<number | undefined> =>
  await apiGetOrUndefined(apiClient, projectSitesRecordingCountRoute.replace(':projectId', projectId.toString()))
