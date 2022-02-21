import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../helpers/defaults'
import { TaxonSpeciesPhoto } from '../types/taxon-species-photo'

export const MODEL_TAXON_SPECIES_PHOTO = 'TaxonSpeciesPhoto'
export const TABLE_TAXON_SPECIES_PHOTO = 'taxon_species_photo'

export const PHOTO_MODEL_ATTRIBUTES: Record<string, Array<keyof TaxonSpeciesPhoto>> = {
  light: ['photoUrl', 'photoCaption', 'photoAuthor', 'photoLicense', 'photoLicenseUrl']
}

export const TaxonSpeciesPhotoModel = defineWithDefaultsAutoPk<TaxonSpeciesPhoto>(
  MODEL_TAXON_SPECIES_PHOTO,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Dimensions
    taxonSpeciesId: DataTypes.INTEGER, // 1

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
