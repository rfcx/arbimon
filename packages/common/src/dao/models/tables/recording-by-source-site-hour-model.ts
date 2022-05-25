import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { RecordingBySourceSiteHour } from '../../types'

export const MODEL_RECORDING_BY_SOURCE_SITE_HOUR = 'RecordingBySourceSiteHour'
const TABLE_RECORDING_BY_SOURCE_SITE_HOUR = 'recording_by_source_site_hour'

export const RecordingBySourceSiteHourModel = defineWithDefaults<RecordingBySourceSiteHour>(
  MODEL_RECORDING_BY_SOURCE_SITE_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE(3),
      primaryKey: true
    },
    sourceId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    projectSiteId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // FKs
    projectId: DataTypes.INTEGER, // 123

    // Facts
    recordingMinutes: DataTypes.STRING(255) // DataTypes.ARRAY(DataTypes.INTEGER) // [1, 2, 3, 6, 7, 14]
  },
  {
    tableName: TABLE_RECORDING_BY_SOURCE_SITE_HOUR
  }
)
