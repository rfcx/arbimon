import { DataTypes } from 'sequelize'

import { DashboardRichnessByHour } from '@/dao/types/dashboard-richness-by-hour'
import { defineWithDefaults } from '../helpers/defaults'

export const MODEL_DASHBOARD_RICHNESS_BY_HOUR = 'DashboardRichnessByHour'
export const TABLE_DASHBOARD_RICHNESS_BY_HOUR = 'dashboard_richness_by_hour'

export const DashboardRichnessByHourModel = defineWithDefaults<DashboardRichnessByHour>(
  MODEL_DASHBOARD_RICHNESS_BY_HOUR,
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
    richness: DataTypes.INTEGER
  },
  {
    tableName: TABLE_DASHBOARD_RICHNESS_BY_HOUR,
    timestamps: false
  }
)
