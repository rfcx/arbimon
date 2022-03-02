import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../helpers/defaults'
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
    detectionCount: DataTypes.INTEGER, // 45,000
    siteCount: DataTypes.INTEGER, // 850
    speciesCount: DataTypes.INTEGER // 94
  },
  {
    tableName: TABLE_LOCATION_PROJECT_METRIC,
    timestamps: false
  }
)
