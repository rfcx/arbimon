import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../helpers/defaults'
import { DashboardRichnessByRisk } from '../types/dashboard-richness-by-risk'

export const MODEL_DASHBOARD_RICHNESS_BY_RISK = 'DashboardRichnessByRisk'
export const TABLE_DASHBOARD_RICHNESS_BY_RISK = 'dashboard_richness_by_risk'

export const DashboardRichnessByRiskModel = defineWithDefaults<DashboardRichnessByRisk>(
  MODEL_DASHBOARD_RICHNESS_BY_RISK,
  {
    // PK
    locationProjectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    riskRatingId: { // 600
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    count: DataTypes.INTEGER // 56
  },
  {
    tableName: TABLE_DASHBOARD_RICHNESS_BY_RISK,
    timestamps: false
  }
)
