import { Sequelize } from 'sequelize'

import { sources, syncTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE } from '@rfcx-bio/common/dao/models/sync-data-type-model'
import { UPDATE_ON_DUPLICATE_SYNC_SOURCE } from '@rfcx-bio/common/dao/models/sync-source-model'

export const updateMasterData = async (sequelize: Sequelize): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Add any missing master-data
  // TODO: Make this a loop
  console.info('Updating master data:')
  await models.SyncSource.bulkCreate(sources, { updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_SOURCE })
  console.info('- Sources')
  await models.SyncDataType.bulkCreate(syncTypes, { updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE })
  console.info('- Sync data type')
  // Remove obsolete master-data
  // TODO
}
