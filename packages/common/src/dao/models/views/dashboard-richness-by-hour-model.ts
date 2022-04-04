import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { DashboardRichnessByHour } from '../../types'

export const MODEL_DASHBOARD_RICHNESS_BY_HOUR = 'DashboardRichnessByHour'
export const TABLE_DASHBOARD_RICHNESS_BY_HOUR = 'dashboard_richness_by_hour'

export const DashboardRichnessByHourModel = defineWithDefaults<DashboardRichnessByHour>(
  MODEL_DASHBOARD_RICHNESS_BY_HOUR,
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
    richness: DataTypes.INTEGER
  },
  {
    tableName: TABLE_DASHBOARD_RICHNESS_BY_HOUR,
    timestamps: false
  }
)
