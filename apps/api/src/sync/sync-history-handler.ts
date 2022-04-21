import { SyncHistoryParams, SyncHistoryResponse } from '@rfcx-bio/common/api-bio/sync'

import { getSyncHistory } from '@/sync/sync-history-bll'
import { Handler } from '~/api-helpers/types'
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
