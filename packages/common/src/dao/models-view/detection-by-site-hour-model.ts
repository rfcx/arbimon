import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { DetectionBySiteHour } from '../types/detection-by-site-hour'

export const MODEL_DETECTION_BY_SITE_HOUR = <const>'DetectionBySiteHour'
export const TABLE_DETECTION_BY_SITE_HOUR = <const>'detection_by_site_hour'

export const DetectionBySiteHourModel = defineWithDefaults<DetectionBySiteHour>(
  MODEL_DETECTION_BY_SITE_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE(3),
      primaryKey: true
    },
    locationSiteId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // FKs
    projectId: DataTypes.INTEGER,

    // Facts
    count: DataTypes.INTEGER, // 1
    durationMinutes: DataTypes.INTEGER // 12
  },
  {
    tableName: TABLE_DETECTION_BY_SITE_HOUR
  }
)
