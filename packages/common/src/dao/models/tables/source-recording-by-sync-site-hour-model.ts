import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { SourceRecordingBySyncSiteHour } from '../../types'

export const MODEL_SOURCE_RECORDING_BY_SYNC_SITE_HOUR = 'SourceRecordingBySyncSiteHour'
const TABLE_SOURCE_RECORDING_BY_SYNC_SITE_HOUR = 'source_recording_by_sync_site_hour'

export const SourceRecordingBySyncSiteHourModel = defineWithDefaults<SourceRecordingBySyncSiteHour>(
  MODEL_SOURCE_RECORDING_BY_SYNC_SITE_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE(3),
      primaryKey: true
    },
    sourceSyncId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    projectSiteId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    recordingMinutes: DataTypes.STRING(255) // DataTypes.ARRAY(DataTypes.INTEGER) // [1, 2, 3, 6, 7, 14]
  },
  {
    tableName: TABLE_SOURCE_RECORDING_BY_SYNC_SITE_HOUR
  }
)
