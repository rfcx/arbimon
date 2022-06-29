import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncError } from '@rfcx-bio/common/dao/types'

export const writeSyncError = async (error: SyncError, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).SyncError
  await model.upsert(error, {
    ...transaction && { transaction }
  })
}
