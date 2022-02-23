import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../helpers/defaults'
import { PredictionOccupancyMap } from '../types'

export const MODEL_PREDICTION_OCCUPANCY_MAP = 'PredictionOccupancyMap'
export const TABLE_PREDICTION_OCCUPANCY_MAP = 'prediction_occupancy_map'

export const LocationSiteModel = defineWithDefaultsAutoPk<PredictionOccupancyMap>(
  MODEL_PREDICTION_OCCUPANCY_MAP,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Dimensions
    taxonSpeciesId: DataTypes.INTEGER, // 1
    locationProjectId: DataTypes.INTEGER, // 1

    // Facts
    predictionOccupancyMapUrl: {
      type: DataTypes.STRING(511),
      allowNull: false
    }
  },
  {
    tableName: TABLE_PREDICTION_OCCUPANCY_MAP
  }
)
