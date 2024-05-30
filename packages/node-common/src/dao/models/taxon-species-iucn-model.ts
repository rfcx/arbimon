import { DataTypes, INTEGER } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type TaxonSpeciesIucn } from '../types/taxon-species-iucn'

export const MODEL_TAXON_SPECIES_IUCN = 'TaxonSpeciesIucn'
export const TABLE_TAXON_SPECIES_IUCN = 'taxon_species_iucn'
export const UPDATE_ON_DUPLICATE_TAXON_SPECIES_IUCN: Array<keyof TaxonSpeciesIucn> = ['commonName', 'description', 'descriptionSourceUrl', 'riskRatingIucnId', 'updatedAt']

export const TaxonSpeciesIucnModel = defineWithDefaults<TaxonSpeciesIucn>(
  MODEL_TAXON_SPECIES_IUCN,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Dimensions
    riskRatingIucnId: INTEGER, // 600 (= CR)

    // Facts
    commonName: DataTypes.STRING(255), // Puerto Rican sharp-shinned hawk
    description: DataTypes.TEXT, // ???
    descriptionSourceUrl: DataTypes.STRING(255) // ???
  },
  {
    tableName: TABLE_TAXON_SPECIES_IUCN
  }
)
