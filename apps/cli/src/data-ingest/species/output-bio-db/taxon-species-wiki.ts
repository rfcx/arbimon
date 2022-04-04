import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_TAXON_SPECIES_PHOTO, ATTRIBUTES_TAXON_SPECIES_WIKI, TaxonSpeciesPhoto, TaxonSpeciesWiki } from '@rfcx-bio/common/dao/types'

export const writeWikiSpeciesDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesWiki[]): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  const updateSpeciesWikiRows = await models.TaxonSpeciesWiki
    .bulkCreate(newData, {
      updateOnDuplicate: ATTRIBUTES_TAXON_SPECIES_WIKI.updateOnDuplicate
    })

  console.info(`- writeWikiSpeciesDataToPostgres: bulk upsert ${updateSpeciesWikiRows.length} species`)
}

export const writeWikiSpeciesPhotoDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesPhoto[]): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  const updateSpeciesWikiPhotoRows = await models.TaxonSpeciesPhoto
    .bulkCreate(newData, {
      updateOnDuplicate: ATTRIBUTES_TAXON_SPECIES_PHOTO.updateOnDuplicate
    })

  console.info(`- writeWikiSpeciesPhotoDataToPostgres: bulk upsert ${updateSpeciesWikiPhotoRows.length} photo info`)
}
