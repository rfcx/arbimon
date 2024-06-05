import { type ModelCtor, type Sequelize } from 'sequelize'

import { riskRatings, sources, syncTypes, taxonClasses } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_RISK_RATING_IUCN } from '@rfcx-bio/node-common/dao/models/risk-rating-iucn-model'
import { UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE } from '@rfcx-bio/node-common/dao/models/sync-data-type-model'
import { UPDATE_ON_DUPLICATE_SYNC_SOURCE } from '@rfcx-bio/node-common/dao/models/sync-source-model'
import { UPDATE_ON_DUPLICATE_TAXON_CLASS } from '@rfcx-bio/node-common/dao/models/taxon-class-model'

export const updateMasterData = async (sequelize: Sequelize): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  const masterData = [
    { model: models.RiskRatingIucn, data: riskRatings, updateOnDuplicate: UPDATE_ON_DUPLICATE_RISK_RATING_IUCN },
    { model: models.SyncSource, data: sources, updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_SOURCE },
    { model: models.SyncDataType, data: syncTypes, updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE },
    { model: models.TaxonClass, data: taxonClasses, updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_CLASS }
    // TODO: TaxonSpeciesSource
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
