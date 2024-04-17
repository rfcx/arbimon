import { type ProjectRouteParamsSerialized } from '@rfcx-bio/common/api-bio/_helpers'
import { type SyncHistoryResponse } from '@rfcx-bio/common/api-bio/sync/sync-history'

import { getSyncHistory } from '@/sync/sync-history-bll'
import { type Handler } from '~/api-helpers/types'
import { projectIdPathParam } from '~/validation'
import { startSync } from './super-project-sync-bll'

export const superProjectSyncHistoryHandler: Handler<SyncHistoryResponse, ProjectRouteParamsSerialized> = async (request, reply) => {
  const projectId = projectIdPathParam(request.params)
  return await getSyncHistory(projectId)
}

export const superProjectSyncHandler: Handler<string, ProjectRouteParamsSerialized> = async (request, reply) => {
  const projectId = projectIdPathParam(request.params)

  await startSync(projectId)

  void reply.code(204)
  return ''
}
