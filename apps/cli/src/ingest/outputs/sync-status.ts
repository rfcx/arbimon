import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

export const writeSyncResult = async (status: SyncStatus, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  // TODO: write sync result
  const model = ModelRepository.getInstance(sequelize).SyncStatus

  const where = { syncSourceId: status.syncSourceId, syncDataTypeId: status.syncDataTypeId, projectId: status.projectId }

  const existingRow = await ModelRepository.getInstance(sequelize).SyncStatus.findOne({
    where
  }) as SyncStatus

  existingRow === null
  ? await model.create(status, { ...transaction && { transaction } })
  : await model.update(status, {
    ...transaction && { transaction },
    where
  })
}
