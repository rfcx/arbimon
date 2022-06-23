import { AxiosInstance } from 'axios'
import { SyncLogByProject } from '@/dao/types'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectSpecificRouteParams } from '../common/project-specific-route'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request types
export type SyncHistoryParams = ProjectRouteParamsSerialized

// Response types
export interface SyncHistoryResponse {
  syncs: SyncLogByProject[]
}

// Route
export const syncHistoryRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/sync-history`

// Service
export const apiBioGetSyncHistory = async (apiClient: AxiosInstance, params: SyncHistoryParams): Promise<SyncHistoryResponse | undefined> =>
  await apiGetOrUndefined(apiClient, `/projects/${params.projectId}/sync-history`)
