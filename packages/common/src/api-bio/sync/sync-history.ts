import { SyncLogByProject } from '@/dao/types'
import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectSpecificRouteParams } from '../common/project-specific-route'

// Request
export type SyncHistoryParams = ProjectSpecificRouteParams

export const syncHistoryRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/sync-history`

export const syncHistoryUrl = (params: SyncHistoryParams): string =>
  `/projects/${params.projectId}/sync-history`

// Response
export interface SyncHistoryResponse {
  syncs: SyncLogByProject[]
}
