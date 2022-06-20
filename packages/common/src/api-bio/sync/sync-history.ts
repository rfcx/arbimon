import { AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type SyncHistoryParams = ProjectRouteParamsSerialized

// Response types
export interface SyncHistoryResponse {
  syncs: Sync[]
}

export interface Sync {
  id: number
  createdAt: Date
  updatedAt: Date
  summaryText: string
}

// Route
export const syncHistoryRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/sync-history`

// Service
export const apiBioGetSyncHistory = async (apiClient: AxiosInstance, params: SyncHistoryParams): Promise<SyncHistoryResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${params.projectId}/sync-history`)
