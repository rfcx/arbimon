import { Sequelize } from 'sequelize'

import { TaxonSpeciesIucnModel } from '@rfcx-bio/common/dao/models/taxon-species-iucn-model'
import { TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'

export const writeWikiSpeciesDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesIucn[]): Promise<void> => {
  const model = TaxonSpeciesIucnModel(sequelize)

  const updateSpeciesIUCNRows = await model.bulkCreate(newData, {
    updateOnDuplicate: [
      'commonName',
      'description',
      'descriptionSourceUrl',
      'riskRatingIucnId'
    ]
  })

  console.info(`- writeWikiSpeciesDataToPostgres: bulk upsert ${updateSpeciesIUCNRows.length} species`)
}
