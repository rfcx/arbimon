import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_TAXON_SPECIES_RFCX } from '../table-names'
import { TaxonSpeciesRfcx } from '../types/taxon-species-rfcx'

export const TaxonSpeciesRfcxModel = defineWithDefaults<TaxonSpeciesRfcx>(
  'TaxonSpeciesRfcx',
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
