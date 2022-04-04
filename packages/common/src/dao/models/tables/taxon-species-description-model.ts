import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesDescription } from '../../types'

export const MODEL_TAXON_SPECIES_DESCRIPTION = 'TaxonSpeciesDescription'
const TABLE_TAXON_SPECIES_DESCRIPTION = 'taxon_species_description'

export const TaxonSpeciesDescriptionModel = defineWithDefaults<TaxonSpeciesDescription>(
  MODEL_TAXON_SPECIES_DESCRIPTION,
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

    // Facts
    sourceUrl: DataTypes.STRING(511), // ???
    description: DataTypes.STRING(255) // Puerto Rican sharp-shinned hawk
  },
  {
    tableName: TABLE_TAXON_SPECIES_DESCRIPTION
  }
)
