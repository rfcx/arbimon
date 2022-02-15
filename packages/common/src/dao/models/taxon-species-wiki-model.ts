import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../dao/helpers/defaults'
import { TaxonSpeciesWiki } from '../../dao/types/taxon-species-wiki'
import { TABLE_TAXON_SPECIES_WIKI } from '../table-names'

export const TaxonSpeciesWikiModel = defineWithDefaults<TaxonSpeciesWiki>(
  'TaxonSpeciesWiki',
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    description: DataTypes.TEXT, // ???
    descriptionSourceUrl: DataTypes.STRING(255) // ???
  },
  {
    tableName: TABLE_TAXON_SPECIES_WIKI
  }
)
