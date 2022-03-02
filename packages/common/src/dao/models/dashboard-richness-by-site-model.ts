import { DataTypes } from 'sequelize'

import { DashboardRichnessBySite } from '@/dao/types/dashboard-richness-by-site'
import { defineWithDefaults } from '../helpers/defaults'

export const MODEL_DASHBOARD_RICHNESS_BY_SITE = 'DashboardRichnessBySite'
export const TABLE_DASHBOARD_RICHNESS_BY_SITE = 'dashboard_richness_by_site'

export const DashboardRichnessBySiteModel = defineWithDefaults<DashboardRichnessBySite>(
  MODEL_DASHBOARD_RICHNESS_BY_SITE,
  {
    // Dimensions
    locationProjectId: { // 1
      type: DataTypes.INTEGER
    },

    // Facts
    name: DataTypes.STRING(255),
    latitude: DataTypes.INTEGER,
    longitude: DataTypes.INTEGER,
    richness: DataTypes.INTEGER
  },
  {
    tableName: TABLE_DASHBOARD_RICHNESS_BY_SITE,
    timestamps: false
  }
)
