import { Sequelize } from 'sequelize/dist'

import { riskRatings, sources, taxonClasses } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_RISK_RATING, UPDATE_ON_DUPLICATE_SOURCE, UPDATE_ON_DUPLICATE_TAXON_CLASS } from '@rfcx-bio/common/dao/models'

export const updateMasterData = async (sequelize: Sequelize): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Add any missing master-data
  console.info('Updating master data')
  await models.RiskRating.bulkCreate(riskRatings, { updateOnDuplicate: UPDATE_ON_DUPLICATE_RISK_RATING })
  await models.Source.bulkCreate(sources, { updateOnDuplicate: UPDATE_ON_DUPLICATE_SOURCE })
  await models.TaxonClass.bulkCreate(taxonClasses, { updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_CLASS })

  // Remove obsolete master-data
  // TODO
}
