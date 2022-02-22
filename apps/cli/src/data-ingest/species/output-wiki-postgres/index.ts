import { Sequelize } from 'sequelize'

import { TaxonSpeciesPhotoModel } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { TaxonSpeciesWikiModel } from '@rfcx-bio/common/dao/models/taxon-species-wiki-model'
import { TaxonSpeciesPhoto, TaxonSpeciesWiki } from '@rfcx-bio/common/dao/types'

export const writeWikiSpeciesDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesWiki[]): Promise<void> => {
  const model = TaxonSpeciesWikiModel(sequelize)
  const updateSpeciesWikiRows = await model.bulkCreate(newData, {
    updateOnDuplicate: [
      'description',
      'descriptionSourceUrl'
    ]
  })
  console.info(`- writeWikiSpeciesDataToPostgres: bulk upsert ${updateSpeciesWikiRows.length} species`)
}

export const writeWikiSpeciesPhotoDataToPostgres = async (sequelize: Sequelize, newData: Array<Omit<TaxonSpeciesPhoto, 'id'>>): Promise<void> => {
  const model = TaxonSpeciesPhotoModel(sequelize)
  await model.destroy({
      truncate: true
    })
  const updateSpeciesWikiPhotoRows = await model.bulkCreate(newData)
  console.info(`- writeWikiSpeciesPhotoDataToPostgres: bulk upsert ${updateSpeciesWikiPhotoRows.length} photo info`)
}
