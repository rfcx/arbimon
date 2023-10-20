import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type LocationProjectRecordingMetric } from '../types/location-project-recording-metric'

export const MODEL_LOCATION_PROJECT_RECORDING_METRIC = 'LocationProjectRecordingMetric'
export const TABLE_LOCATION_PROJECT_RECORDING_METRIC = 'location_project_recording_metric'

export const LocationProjectRecordingMetricModel = defineWithDefaults<LocationProjectRecordingMetric>(
  MODEL_LOCATION_PROJECT_RECORDING_METRIC,
  {
    locationProjectId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    recordingMinutesCount: DataTypes.INTEGER,
    minDate: DataTypes.DATE,
    maxDate: DataTypes.DATE
  },
  {
    tableName: TABLE_LOCATION_PROJECT_RECORDING_METRIC,
    timestamps: false
  }
)
