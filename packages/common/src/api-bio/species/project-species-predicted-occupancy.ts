import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type ProjectSpeciesPredictedOccupancyParams = ProjectRouteParamsSerialized & {
  speciesSlug: string
  filenameWithoutExtension: string
}

// Route
export const projectSpeciesPredictedOccupancyRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/predicted-occupancy/:speciesSlug/:filenameWithoutExtension`

// Service
// TODO: Delete this (store files in S3)
export const apiBioGetProjectSpeciesPredictedOccupancy = async (apiClient: AxiosInstance, url: string): Promise<Blob | undefined> =>
  await apiGetOrUndefined(apiClient, url, { baseURL: '', responseType: 'blob' })
