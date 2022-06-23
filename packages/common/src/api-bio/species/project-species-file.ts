import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers/project-specific-route'

// Request types
export type ProjectSpeciesFileParams = ProjectRouteParamsSerialized & {
  speciesSlug: string
  filenameWithoutExtension: string
}

// Route
export const projectSpeciesPredictedOccupancyRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/predicted-occupancy/:speciesSlug/:filenameWithoutExtension`

// Service
// TODO: Delete this (store files in S3)
export const apiBioGetProjectSpeciesPredictedOccupancy = async (apiClient: AxiosInstance, url: string): Promise<Blob | undefined> =>
  await apiGetOrUndefined(apiClient, url, { baseURL: '', responseType: 'blob' })
