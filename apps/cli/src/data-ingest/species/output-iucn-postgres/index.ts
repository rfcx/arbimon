import { Sequelize } from 'sequelize'

import { TaxonSpeciesIucnModel } from '@rfcx-bio/common/dao/models/taxon-species-iucn-model'
import { ATTRIBUTES_TAXON_SPECIES_IUCN, TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'

export const writeIucnSpeciesDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesIucn[]): Promise<void> => {
  const model = TaxonSpeciesIucnModel(sequelize)

  const updateSpeciesIUCNRows = await model.bulkCreate(newData, {
    updateOnDuplicate: ATTRIBUTES_TAXON_SPECIES_IUCN.updateOnDuplicate
  })

  console.info(`- writeIucnSpeciesDataToPostgres: bulk upsert ${updateSpeciesIUCNRows.length} species`)
}
