import { ModelCtor, Sequelize } from 'sequelize'

import { riskRatings, sources, syncTypes, taxonClasses } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE } from '@rfcx-bio/common/dao/models/sync-data-type-model'
import { UPDATE_ON_DUPLICATE_SYNC_SOURCE } from '@rfcx-bio/common/dao/models/sync-source-model'
import { RiskRatingIucn, TaxonClass } from '@rfcx-bio/common/dao/types'

export const UPDATE_ON_DUPLICATE_RISK_RATING_IUCN: Array<(keyof RiskRatingIucn)> = ['code', 'isThreatened']
export const UPDATE_ON_DUPLICATE_TAXON_CLASS: Array<(keyof TaxonClass)> = ['slug', 'commonName']

export const updateMasterData = async (sequelize: Sequelize): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  const masterData = [
    { model: models.RiskRatingIucn, data: riskRatings, updateOnDuplicate: UPDATE_ON_DUPLICATE_RISK_RATING_IUCN },
    { model: models.SyncSource, data: sources, updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_SOURCE },
    { model: models.SyncDataType, data: syncTypes, updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE },
    { model: models.TaxonClass, data: taxonClasses, updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_CLASS }
  ]

  // Add any missing master-data
  console.info('Updating master data:')
  for (const { model, data, updateOnDuplicate } of masterData) {
    console.info(`- ${model.name}`)
    await (model as ModelCtor<any>).bulkCreate(data, { updateOnDuplicate })
  }

  // Remove obsolete master-data
  // TODO
}
