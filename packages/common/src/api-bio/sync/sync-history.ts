import { PROJECT_SPECIFIC_ROUTE_PREFIX, ProjectSpecificRouteParams } from '../_helpers'

// Request
export type SyncHistoryParams = ProjectSpecificRouteParams

export const syncHistoryRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/sync-history`

export const syncHistoryUrl = (params: SyncHistoryParams): string =>
  `/projects/${params.projectId}/sync-history`

// Response
export interface Sync {
  id: number
  createdAt: Date
  updatedAt: Date
  summaryText: string
}

export interface SyncHistoryResponse {
  syncs: Sync[]
}
