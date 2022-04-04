import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesCommonName } from '../../types'

export const MODEL_TAXON_SPECIES_COMMON_NAME = 'TaxonSpeciesCommonName'
const TABLE_TAXON_SPECIES_COMMON_NAME = 'taxon_species_common_name'

export const TaxonSpeciesCommonNameModel = defineWithDefaults<TaxonSpeciesCommonName>(
  MODEL_TAXON_SPECIES_COMMON_NAME,
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
    commonName: DataTypes.STRING(255) // Puerto Rican sharp-shinned hawk
  },
  {
    tableName: TABLE_TAXON_SPECIES_COMMON_NAME
  }
)
