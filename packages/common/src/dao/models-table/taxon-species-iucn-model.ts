import { DataTypes, INTEGER } from 'sequelize'

import { defineWithDefaults } from '../model-helpers/defaults'
import { TaxonSpeciesIucn } from '../types/taxon-species-iucn'

export const MODEL_TAXON_SPECIES_IUCN = 'TaxonSpeciesIucn'
export const TABLE_TAXON_SPECIES_IUCN = 'taxon_species_iucn'

export const TaxonSpeciesIucnModel = defineWithDefaults<TaxonSpeciesIucn>(
  MODEL_TAXON_SPECIES_IUCN,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // FKs
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
