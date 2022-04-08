import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { TaxonSpeciesSource } from '../../types'

export const MODEL_TAXON_SPECIES_SOURCE = 'TaxonSpeciesSource'
const TABLE_SPECIES_SOURCE = 'taxon_species_source'
export const UPDATE_ON_DUPLICATE_TAXON_SPECIES_SOURCE: Array<(keyof TaxonSpeciesSource)> = ['name']

export const TaxonSpeciesSourceModel = defineWithDefaultsAutoPk<TaxonSpeciesSource>(
  MODEL_TAXON_SPECIES_SOURCE,
  {
    // PK
    id: { // -1, 100, 700
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    name: DataTypes.STRING(255) // RFCx, IUCN, Wikipedia
  },
  {
    tableName: TABLE_SPECIES_SOURCE
  }
)
