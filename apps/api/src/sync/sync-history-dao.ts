import { type Sequelize } from 'sequelize'

import { type Sync } from '@rfcx-bio/common/api-bio/sync/sync-history'
import { type AllModels } from '@rfcx-bio/common/dao/model-repository'

export const getSyncs = async (models: AllModels, sequelize: Sequelize, locationProjectId: number): Promise<Sync[]> => {
  return await models.SyncLogByProject
    .findAll({
      attributes: [
        'id', 'createdAt', 'updatedAt', 'delta',
        [sequelize.col('SyncSource.name'), 'sourceType'],
        [sequelize.col('SyncDataType.name'), 'dataType']
      ],
      where: { locationProjectId },
      include: [
        {
          model: models.SyncSource,
          attributes: []
        },
        {
          model: models.SyncDataType,
          attributes: []
        }
      ],
      order: [['updatedAt', 'DESC']],
      raw: true
    }) as unknown as Sync[]
}
