import { type Sequelize, type Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type SyncLogByProject } from '@rfcx-bio/common/dao/types'

export const writeSyncLogByProject = async (log: Omit<SyncLogByProject, 'id' | 'createdAt' | 'updatedAt'>, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).SyncLogByProject
  await model.upsert(log, {
    ...transaction && { transaction }
  })
}
