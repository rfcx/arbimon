import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesPhoto } from '../../types'

export const MODEL_TAXON_SPECIES_PHOTO = 'TaxonSpeciesPhoto'
const TABLE_TAXON_SPECIES_PHOTO = 'taxon_species_photo'

export const TaxonSpeciesPhotoModel = defineWithDefaults<TaxonSpeciesPhoto>(
  MODEL_TAXON_SPECIES_PHOTO,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    taxonSpeciesSourceId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    order: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1
    },

    // Facts
    sourceUrl: DataTypes.STRING(255), // https://wikipedia??
    photoUrl: DataTypes.STRING(511), // https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Puerto_Rican_Sharp-shinned_hawk_sitting_on_tree_branch.jpg/268px-Puerto_Rican_Sharp-shinned_hawk_sitting_on_tree_branch.jpg
    license: DataTypes.STRING(255), // Public domain
    caption: DataTypes.STRING(255), // Puerto Rican sharp-shinned hawk
    author: DataTypes.STRING(255) // Mike Morel/U. S. Fish and Wildlife Service
  },
  {
    tableName: TABLE_TAXON_SPECIES_PHOTO
  }
)
