import { type Sequelize } from 'sequelize'

import { TaxonSpeciesIucnModel, UPDATE_ON_DUPLICATE_TAXON_SPECIES_IUCN } from '@rfcx-bio/node-common/dao/models/taxon-species-iucn-model'
import { type TaxonSpeciesIucn } from '@rfcx-bio/node-common/dao/types'

export const writeIucnSpeciesDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesIucn[]): Promise<void> => {
  const model = TaxonSpeciesIucnModel(sequelize)

  const updateSpeciesIUCNRows = await model.bulkCreate(newData, {
    updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_SPECIES_IUCN
  })

  console.info(`- writeIucnSpeciesDataToPostgres: bulk upsert ${updateSpeciesIUCNRows.length} species`)
}
