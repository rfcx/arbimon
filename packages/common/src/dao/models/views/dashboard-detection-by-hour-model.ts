import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { DashboardDetectionByHour } from '../../types'

export const MODEL_DASHBOARD_DETECTION_BY_HOUR = 'DashboardDetectionByHour'
export const TABLE_DASHBOARD_DETECTION_BY_HOUR = 'dashboard_detection_by_hour'

export const DashboardDetectionByHourModel = defineWithDefaults<DashboardDetectionByHour>(
  MODEL_DASHBOARD_DETECTION_BY_HOUR,
  {
    // PK
    projectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    hour: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    count: DataTypes.INTEGER
  },
  {
    tableName: TABLE_DASHBOARD_DETECTION_BY_HOUR,
    timestamps: false
  }
)
