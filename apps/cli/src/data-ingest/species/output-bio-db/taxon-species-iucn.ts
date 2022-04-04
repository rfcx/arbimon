import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_TAXON_SPECIES_IUCN, TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'

export const writeIucnSpeciesDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesIucn[]): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  const updateSpeciesIUCNRows = await models.TaxonSpeciesIucn.bulkCreate(newData, {
    updateOnDuplicate: ATTRIBUTES_TAXON_SPECIES_IUCN.updateOnDuplicate
  })

  console.info(`- writeIucnSpeciesDataToPostgres: bulk upsert ${updateSpeciesIUCNRows.length} species`)
}
