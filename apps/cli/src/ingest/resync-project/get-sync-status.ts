import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type SyncStatus } from '@rfcx-bio/common/dao/types'

export const getSyncStatus = async (sequelize: Sequelize, syncSourceId: number, syncDataTypeId: number): Promise<SyncStatus> => {
  const { SyncStatus } = ModelRepository.getInstance(sequelize)
  const result = await SyncStatus.findOne({ where: { syncSourceId, syncDataTypeId } })
  if (result === null) throw new Error('Invalid sync source or sync data type')
  return result
}
