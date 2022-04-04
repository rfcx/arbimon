import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { TaxonSpeciesSource } from '../../types'

export const MODEL_TAXON_SPECIES_SOURCE = 'TaxonSpeciesSource'
const TABLE_SPECIES_SOURCE = 'taxon_species_source'

export const TaxonSpeciesSourceModel = defineWithDefaultsAutoPk<TaxonSpeciesSource>(
  MODEL_TAXON_SPECIES_SOURCE,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Facts
    name: DataTypes.STRING(255),
    priority: DataTypes.INTEGER
  },
  {
    tableName: TABLE_SPECIES_SOURCE
  }
)
