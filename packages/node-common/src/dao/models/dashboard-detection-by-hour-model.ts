import { DataTypes } from 'sequelize'

import { type DashboardDetectionByHour } from '@/dao/types/dashboard-detection-by-hour'
import { defineWithDefaults } from '../model-factory-helpers/defaults'

export const MODEL_DASHBOARD_DETECTION_BY_HOUR = 'DashboardDetectionByHour'
export const TABLE_DASHBOARD_DETECTION_BY_HOUR = 'dashboard_detection_by_hour'

export const DashboardDetectionByHourModel = defineWithDefaults<DashboardDetectionByHour>(
  MODEL_DASHBOARD_DETECTION_BY_HOUR,
  {
    // PK
    locationProjectId: { // 1
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
