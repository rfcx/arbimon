import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { DashboardRichnessBySite } from '../../types'

export const MODEL_DASHBOARD_RICHNESS_BY_SITE = 'DashboardRichnessBySite'
export const TABLE_DASHBOARD_RICHNESS_BY_SITE = 'dashboard_richness_by_site'

export const DashboardRichnessBySiteModel = defineWithDefaults<DashboardRichnessBySite>(
  MODEL_DASHBOARD_RICHNESS_BY_SITE,
  {
    // PK
    projectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },

    // Facts
    latitude: DataTypes.INTEGER,
    longitude: DataTypes.INTEGER,
    richness: DataTypes.INTEGER
  },
  {
    tableName: TABLE_DASHBOARD_RICHNESS_BY_SITE,
    timestamps: false
  }
)
