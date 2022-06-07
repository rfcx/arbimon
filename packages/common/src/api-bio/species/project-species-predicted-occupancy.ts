import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type ProjectSpeciesPredictedOccupancyParams = ProjectRouteParamsSerialized & {
  speciesSlug: string
  filenameWithoutExtension: string
}

// Route
export const projectSpeciesPredictedOccupancyRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/predicted-occupancy/:speciesSlug/:filenameWithoutExtension`

// Service
// TODO: Delete this (store files in S3)
export const getPredictedOccupancy = async (apiClient: AxiosInstance, url: string): Promise<Blob | undefined> =>
  await apiGetOrUndefined(apiClient, url, { baseURL: '', responseType: 'blob' })
