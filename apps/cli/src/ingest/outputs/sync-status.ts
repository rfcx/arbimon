import { type Sequelize, type Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type SyncStatus } from '@rfcx-bio/common/dao/types'

export const writeSyncResult = async (status: SyncStatus, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  // TODO: write sync result
  const model = ModelRepository.getInstance(sequelize).SyncStatus
  await model.upsert(status, {
    ...transaction && { transaction }
  })
}
