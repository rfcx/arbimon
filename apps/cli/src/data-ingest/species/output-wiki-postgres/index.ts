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
  // we have to update existing data & create new data
  await model.destroy({
      truncate: true,
      restartIdentity: true // Temporary solution: by destroy a whole table (restartIdentity avoid create new PK)
    })
  const updateSpeciesWikiPhotoRows = await model.bulkCreate(newData)
  // const updateSpeciesWikiPhotoRows = newData.map(async newData => await Promise.all(await model.update(newData, {
  //   where: {
  //     taxonSpeciesId: newData.taxonSpeciesId
  //   }
  // })))
  console.info(`- writeWikiSpeciesPhotoDataToPostgres: bulk upsert ${updateSpeciesWikiPhotoRows.length} photo info`)
}
