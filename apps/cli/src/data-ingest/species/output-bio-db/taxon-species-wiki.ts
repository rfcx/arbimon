import { Sequelize } from 'sequelize'

import { TaxonSpeciesPhotoModel } from '@rfcx-bio/common/dao/models-table/taxon-species-photo-model'
import { TaxonSpeciesWikiModel } from '@rfcx-bio/common/dao/models-table/taxon-species-wiki-model'
import { ATTRIBUTES_TAXON_SPECIES_PHOTO, ATTRIBUTES_TAXON_SPECIES_WIKI, TaxonSpeciesPhoto, TaxonSpeciesWiki } from '@rfcx-bio/common/dao/types'

export const writeWikiSpeciesDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesWiki[]): Promise<void> => {
  const updateSpeciesWikiRows = await TaxonSpeciesWikiModel(sequelize)
    .bulkCreate(newData, {
      updateOnDuplicate: ATTRIBUTES_TAXON_SPECIES_WIKI.updateOnDuplicate
    })

  console.info(`- writeWikiSpeciesDataToPostgres: bulk upsert ${updateSpeciesWikiRows.length} species`)
}

export const writeWikiSpeciesPhotoDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesPhoto[]): Promise<void> => {
  const updateSpeciesWikiPhotoRows = await TaxonSpeciesPhotoModel(sequelize)
    .bulkCreate(newData, {
      updateOnDuplicate: ATTRIBUTES_TAXON_SPECIES_PHOTO.updateOnDuplicate
    })

  console.info(`- writeWikiSpeciesPhotoDataToPostgres: bulk upsert ${updateSpeciesWikiPhotoRows.length} photo info`)
}
