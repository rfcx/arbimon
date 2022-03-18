import { Sequelize } from 'sequelize'

import { TaxonSpeciesWikiModel } from '@rfcx-bio/common/dao/models/taxon-species-wiki-model'
import { TaxonSpeciesWiki } from '@rfcx-bio/common/dao/types'

export const getTaxonSpeciesWikiFromBioDb = async (sequelize: Sequelize): Promise<TaxonSpeciesWiki[]> =>
  await TaxonSpeciesWikiModel(sequelize)
    .findAll({ raw: true })
