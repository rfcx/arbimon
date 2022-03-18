import { Sequelize } from 'sequelize'

import { TaxonSpeciesIucnModel } from '@rfcx-bio/common/dao/models/taxon-species-iucn-model'
import { TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'

export const getTaxonSpeciesIucnFromBioDb = async (sequelize: Sequelize): Promise<TaxonSpeciesIucn[]> =>
  await TaxonSpeciesIucnModel(sequelize)
    .findAll({ raw: true })
