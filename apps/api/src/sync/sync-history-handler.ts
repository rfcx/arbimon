import { type SyncHistoryParams, type SyncHistoryResponse } from '@rfcx-bio/common/api-bio/sync/sync-history'

import { getSyncHistory } from '@/sync/sync-history-bll'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertAuthorizedForProject, assertPathParamsExist } from '~/validation'

export const syncHistoryHandler: Handler<SyncHistoryResponse, SyncHistoryParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  assertAuthorizedForProject(req)

  // Response
  return await getSyncHistory(projectIdInteger)
}
