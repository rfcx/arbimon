import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type LocationProjectDetectionMetric } from '../types/location-project-detection-metric'

export const MODEL_LOCATION_PROJECT_DETECTION_METRIC = 'LocationProjectDetectionMetric'
export const TABLE_LOCATION_PROJECT_DETECTION_METRIC = 'location_project_detection_metric'

export const LocationProjectDetectionMetricModel = defineWithDefaults<LocationProjectDetectionMetric>(
  MODEL_LOCATION_PROJECT_DETECTION_METRIC,
  {
    locationProjectId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    speciesCount: DataTypes.INTEGER,
    detectionMinutesCount: DataTypes.INTEGER,
    minDate: DataTypes.DATE,
    maxDate: DataTypes.DATE
  },
  {
    tableName: TABLE_LOCATION_PROJECT_DETECTION_METRIC,
    timestamps: false
  }
)
