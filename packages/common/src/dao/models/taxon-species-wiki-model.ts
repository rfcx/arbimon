import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '@/dao/helpers/defaults'
import { TaxonSpeciesWiki } from '@/dao/types/taxon-species-wiki'
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
    descriptionSourceUrl: DataTypes.STRING(255), // ???
    photoUrl: DataTypes.STRING(511), // https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Puerto_Rican_Sharp-shinned_hawk_sitting_on_tree_branch.jpg/268px-Puerto_Rican_Sharp-shinned_hawk_sitting_on_tree_branch.jpg
    photoCaption: DataTypes.STRING(255), // Puerto Rican sharp-shinned hawk
    photoAuthor: DataTypes.STRING(255), // Mike Morel/U. S. Fish and Wildlife Service
    photoLicense: DataTypes.STRING(255), // Public domain
    photoLicenseUrl: DataTypes.STRING(255) // https://www.fws.gov/faq/imagefaq.html
  },
  {
    tableName: TABLE_TAXON_SPECIES_WIKI
  }
)
