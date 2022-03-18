import { Sequelize } from 'sequelize'

import { TaxonSpeciesPhotoModel } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { TaxonSpeciesPhoto } from '@rfcx-bio/common/dao/types'

export const getTaxonSpeciesPhotoFromBioDb = async (sequelize: Sequelize): Promise<TaxonSpeciesPhoto[]> =>
  await TaxonSpeciesPhotoModel(sequelize)
    .findAll({ raw: true })
