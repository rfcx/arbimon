import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { DetectionBySiteHour } from '../types/detection-by-site-hour'

export const MODEL_DETECTION_BY_SITE_HOUR = 'DetectionBySiteHour'
export const TABLE_DETECTION_BY_SITE_HOUR = 'detection_by_site_hour'

export const DetectionBySiteSpeciesHourModel = defineWithDefaults<DetectionBySiteHour>(
  MODEL_DETECTION_BY_SITE_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE,
      primaryKey: true
    },
    locationSiteId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Dimensions
    locationProjectId: DataTypes.INTEGER,

    // Facts
    // Count of the minutes where detections are present
    count: DataTypes.INTEGER
  },
  {
    tableName: TABLE_DETECTION_BY_SITE_HOUR
  }
)
