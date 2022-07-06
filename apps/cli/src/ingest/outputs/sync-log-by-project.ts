import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncLogByProject } from '@rfcx-bio/common/dao/types'

export const writeSyncLogByProject = async (log: Omit<SyncLogByProject, 'id'>, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).SyncLogByProject
  await model.upsert(log, {
    ...transaction && { transaction }
  })
}
