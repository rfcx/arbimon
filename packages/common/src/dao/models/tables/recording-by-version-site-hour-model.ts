import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { RecordingByVersionSiteHour } from '../../types'

export const MODEL_RECORDING_BY_VERSION_SITE_HOUR = 'RecordingByVersionSiteHour'
const TABLE_RECORDING_BY_VERSION_SITE_HOUR = 'recording_by_version_site_hour'

export const RecordingByVersionSiteHourModel = defineWithDefaults<RecordingByVersionSiteHour>(
  MODEL_RECORDING_BY_VERSION_SITE_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE(3),
      primaryKey: true
    },
    projectVersionId: { // 123
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
    countRecordingMinutes: DataTypes.INTEGER
  },
  {
    tableName: TABLE_RECORDING_BY_VERSION_SITE_HOUR
  }
)
