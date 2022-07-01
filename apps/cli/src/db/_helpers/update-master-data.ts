import { Sequelize } from 'sequelize'

import { sources, syncTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE } from '@rfcx-bio/common/dao/models/sync-data-type-model'
import { UPDATE_ON_DUPLICATE_SYNC_SOURCE } from '@rfcx-bio/common/dao/models/sync-source-model'

export const updateMasterData = async (sequelize: Sequelize): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  const masterData = [
    { model: models.SyncSource, data: sources, updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_SOURCE },
    { model: models.SyncDataType, data: syncTypes, updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE }
  ]

  // Add any missing master-data
  console.info('Updating master data:')
  for (const { model, data, updateOnDuplicate } of masterData) {
    console.info(`- ${model.name}`)
    await model.bulkCreate(data, { updateOnDuplicate })
  }

  // Remove obsolete master-data
  // TODO
}
