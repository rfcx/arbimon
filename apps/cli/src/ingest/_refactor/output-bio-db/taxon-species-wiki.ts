import { type Sequelize } from 'sequelize'

import { TaxonSpeciesPhotoModel, UPDATE_ON_DUPLICATE_TAXON_SPECIES_PHOTO } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { TaxonSpeciesWikiModel, UPDATE_ON_DUPLICATE_TAXON_SPECIES_WIKI } from '@rfcx-bio/common/dao/models/taxon-species-wiki-model'
import { type TaxonSpeciesPhoto, type TaxonSpeciesWiki } from '@rfcx-bio/common/dao/types'

export const writeWikiSpeciesDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesWiki[]): Promise<void> => {
  const updateSpeciesWikiRows = await TaxonSpeciesWikiModel(sequelize)
    .bulkCreate(newData, {
      updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_SPECIES_WIKI
    })

  console.info(`- writeWikiSpeciesDataToPostgres: bulk upsert ${updateSpeciesWikiRows.length} species`)
}

export const writeWikiSpeciesPhotoDataToPostgres = async (sequelize: Sequelize, newData: TaxonSpeciesPhoto[]): Promise<void> => {
  const updateSpeciesWikiPhotoRows = await TaxonSpeciesPhotoModel(sequelize)
    .bulkCreate(newData, {
      updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_SPECIES_PHOTO
    })

  console.info(`- writeWikiSpeciesPhotoDataToPostgres: bulk upsert ${updateSpeciesWikiPhotoRows.length} photo info`)
}
