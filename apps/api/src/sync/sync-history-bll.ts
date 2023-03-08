import { type SyncHistoryResponse } from '@rfcx-bio/common/api-bio/sync/sync-history'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSyncs } from '@/sync/sync-history-dao'
import { getSequelize } from '~/db'

export const getSyncHistory = async (locationProjectId: number): Promise<SyncHistoryResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)
  const syncs = await getSyncs(models, sequelize, locationProjectId)

  return {
    syncs
  }
}
