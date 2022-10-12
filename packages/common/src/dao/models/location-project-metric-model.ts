import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { LocationProjectMetric } from '../types/location-project-metric'

export const MODEL_LOCATION_PROJECT_METRIC = 'LocationProjectMetric'
export const TABLE_LOCATION_PROJECT_METRIC = 'location_project_metric'

export const LocationProjectMetricModel = defineWithDefaults<LocationProjectMetric>(
  MODEL_LOCATION_PROJECT_METRIC,
  {
    // PK
    locationProjectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    detectionMinutesCount: DataTypes.INTEGER, // 45,000
    speciesCount: DataTypes.INTEGER, // 94
    maxDate: DataTypes.DATE,
    minDate: DataTypes.DATE
  },
  {
    tableName: TABLE_LOCATION_PROJECT_METRIC,
    timestamps: false
  }
)
