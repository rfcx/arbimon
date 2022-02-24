import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../helpers/defaults'
import { TaxonSpeciesPredictedOccupancyMap } from '../types'

export const MODEL_TAXON_SPECIES_PREDICTED_OCCUPANCY_MAP = 'TaxonSpeciesPredictedOccupancyMap'
export const TABLE_TAXON_SPECIES_PREDICTED_OCCUPANCY_MAP = 'taxon_species_predicted_occupancy_map'

export const TaxonSpeciesPredictedOccupancyMapModel = defineWithDefaultsAutoPk<TaxonSpeciesPredictedOccupancyMap>(
  MODEL_TAXON_SPECIES_PREDICTED_OCCUPANCY_MAP,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Dimensions
    locationProjectId: DataTypes.INTEGER, // 1
    taxonSpeciesId: DataTypes.INTEGER, // 1

    // Facts
    mapUrl: DataTypes.STRING(511)
  },
  {
    tableName: TABLE_TAXON_SPECIES_PREDICTED_OCCUPANCY_MAP
  }
)
