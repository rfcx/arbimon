import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { TaxonSpeciesPhoto } from '../types/taxon-species-photo'

export const MODEL_TAXON_SPECIES_PHOTO = 'TaxonSpeciesPhoto'
export const TABLE_TAXON_SPECIES_PHOTO = 'taxon_species_photo'
export const UPDATE_ON_DUPLICATE_TAXON_SPECIES_PHOTO: Array<keyof TaxonSpeciesPhoto> = ['photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl'],

export const TaxonSpeciesPhotoModel = defineWithDefaults<TaxonSpeciesPhoto>(
  MODEL_TAXON_SPECIES_PHOTO,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    source: { // Wiki
      type: DataTypes.STRING(255),
      primaryKey: true
    },

    // Facts
    photoUrl: DataTypes.STRING(511), // https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Puerto_Rican_Sharp-shinned_hawk_sitting_on_tree_branch.jpg/268px-Puerto_Rican_Sharp-shinned_hawk_sitting_on_tree_branch.jpg
    photoCaption: DataTypes.STRING(255), // Puerto Rican sharp-shinned hawk
    photoAuthor: DataTypes.STRING(255), // Mike Morel/U. S. Fish and Wildlife Service
    photoLicense: DataTypes.STRING(255), // Public domain
    photoLicenseUrl: { // https://www.fws.gov/faq/imagefaq.html
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    tableName: TABLE_TAXON_SPECIES_PHOTO
  }
)
