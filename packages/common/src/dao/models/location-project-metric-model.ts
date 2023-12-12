import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type LocationProjectMetric } from '../types/location-project-metric'

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
    speciesCount: DataTypes.INTEGER,
    siteCount: DataTypes.INTEGER,
    recordingMinutesCount: DataTypes.INTEGER,
    detectionMinutesCount: DataTypes.INTEGER,
    minDate: DataTypes.DATE,
    maxDate: DataTypes.DATE,
    recordingMinDate: DataTypes.DATE,
    recordingMaxDate: DataTypes.DATE,
    detectionMinDate: DataTypes.DATE,
    detectionMaxDate: DataTypes.DATE
  },
  {
    tableName: TABLE_LOCATION_PROJECT_METRIC,
    timestamps: false
  }
)
