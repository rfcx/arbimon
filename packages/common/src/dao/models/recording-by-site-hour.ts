import { DataTypes, Optional } from 'sequelize'

import { defineWithDefaults, ModelForInterface } from '../model-factory-helpers/defaults'
import { RecordingBySiteHour } from '../types'

export const MODEL_RECORDING_BY_SITE_HOUR = 'RecordingBySiteHour'
const TABLE_RECORDING_BY_SITE_HOUR = 'recording_by_site_hour'

export const RecordingBySiteHourModel = defineWithDefaults<RecordingBySiteHour, ModelForInterface<RecordingBySiteHour, Optional<RecordingBySiteHour, 'createdAt' | 'updatedAt'>>>(
  MODEL_RECORDING_BY_SITE_HOUR,
  {
    // PK
    timePrecisionHourLocal: {
      type: DataTypes.DATE,
      primaryKey: true
    },
    locationProjectId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    locationSiteId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Logging
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,

    // Facts
    totalDurationInMinutes: DataTypes.FLOAT,
    recordedMinutes: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  {
    tableName: TABLE_RECORDING_BY_SITE_HOUR
  }
)
