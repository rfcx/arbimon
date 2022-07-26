import { Sync } from '@rfcx-bio/common/api-bio/sync/sync-history'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'

export const getSyncs = async (models: AllModels, locationProjectId: number): Promise<Sync[]> => {
  return await models.SyncLogByProject
    .findAll({
      where: { locationProjectId },
      include: [
        {
          model: models.SyncSource,
          attributes: [['name', 'sourceType']]
        },
        {
          model: models.SyncDataType,
          attributes: [['name', 'dataType']]
        }
      ],
      order: [['updatedAt', 'DESC']]
    }) as unknown as Sync[]
}
