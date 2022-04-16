import { Sequelize } from 'sequelize'

import { riskRatings, sources, taxonClasses, taxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_RISK_RATING, UPDATE_ON_DUPLICATE_SOURCE, UPDATE_ON_DUPLICATE_TAXON_CLASS, UPDATE_ON_DUPLICATE_TAXON_SPECIES_SOURCE } from '@rfcx-bio/common/dao/models'

export const updateMasterData = async (sequelize: Sequelize): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Add any missing master-data
  // TODO: Make this a loop
  console.info('Updating master data:')
  await models.RiskRating.bulkCreate(riskRatings, { updateOnDuplicate: UPDATE_ON_DUPLICATE_RISK_RATING })
  console.info('- Risk ratings')
  await models.Source.bulkCreate(sources, { updateOnDuplicate: UPDATE_ON_DUPLICATE_SOURCE })
  console.info('- Sources')
  await models.TaxonClass.bulkCreate(taxonClasses, { updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_CLASS })
  console.info('- Taxon classes')
  await models.TaxonSpeciesSource.bulkCreate(taxonSpeciesSources, { updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_SPECIES_SOURCE })
  console.info('- Taxon species sources')

  // Remove obsolete master-data
  // TODO
}
