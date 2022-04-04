import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesRfcx } from '../../types'

export const MODEL_TAXON_SPECIES_RFCX = 'TaxonSpeciesRfcx'
export const TABLE_TAXON_SPECIES_RFCX = 'taxon_species_rfcx'

export const TaxonSpeciesRfcxModel = defineWithDefaults<TaxonSpeciesRfcx>(
  MODEL_TAXON_SPECIES_RFCX,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    commonName: { // Puerto Rican sharp-shinned hawk
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: { // ???
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: TABLE_TAXON_SPECIES_RFCX
  }
)
