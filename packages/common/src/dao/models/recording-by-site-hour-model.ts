import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { RecordingBySiteHour } from '../types'

export const MODEL_RECORDING_BY_SITE_HOUR = 'RecordingBySiteHour'
const TABLE_RECORDING_BY_SITE_HOUR = 'recording_by_site_hour'

export const RecordingBySiteHourModel = defineWithDefaults<RecordingBySiteHour>(
  MODEL_RECORDING_BY_SITE_HOUR,
  {
    // PK
    timePrecisionHourLocal: {
      type: DataTypes.DATE,
      primaryKey: true
    },
    locationSiteId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Dimensions
    locationProjectId: DataTypes.INTEGER,

    // Facts
    // Count of the minutes where audio is present (always the length of `countByMinutes`)
    count: DataTypes.INTEGER,
    // Array of `(index,count)` pairs where `count` is the number of recordings at minute `index`
    // Example: {{0,1},{5,2},{10,1}} => 1 recording in 0th minute, 2 recordings in the 5th minute, 1 recording in the 10th minute
    // `index` is between 0 and 59, `count` is a positive integer
    countsByMinute: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER)),
    // Total length in minutes of all the recordings
    totalDurationInMinutes: DataTypes.FLOAT
  },
  {
    tableName: TABLE_RECORDING_BY_SITE_HOUR
  }
)
