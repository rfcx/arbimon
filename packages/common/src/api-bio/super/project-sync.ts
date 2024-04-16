import { type AxiosInstance } from 'axios'

import { type SyncHistoryResponse } from '../sync/sync-history'
import { superProjectsRoute } from './projects'

// Route
export const superProjectSyncHistoryRoute = superProjectsRoute + '/:projectId/sync-history'
export const superProjectSyncRoute = superProjectsRoute + '/:projectId/sync'

// Service
export const apiBioSuperGetSyncHistory = async (apiClient: AxiosInstance, projectId: number): Promise<SyncHistoryResponse> => {
  return await apiClient.get(superProjectSyncHistoryRoute.replace(':projectId', projectId.toString())).then(res => res.data)
}

export const apiBioSuperStartSync = async (apiClient: AxiosInstance, projectId: number): Promise<void> => {
  await apiClient.post(superProjectSyncRoute.replace(':projectId', projectId.toString()), {})
}
