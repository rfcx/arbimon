import { DataTypes } from 'sequelize'

import { DashboardDetectionsBySite } from '@/dao/types/dashboard-detections-by-site'
import { defineWithDefaults } from '../helpers/defaults'

export const MODEL_DASHBOARD_DETECTIONS_BY_SITE = 'DashboardDetectionsBySite'
export const TABLE_DASHBOARD_DETECTIONS_BY_SITE = 'dashboard_detections_by_site'

export const DashboardDetectionsBySiteModel = defineWithDefaults<DashboardDetectionsBySite>(
  MODEL_DASHBOARD_DETECTIONS_BY_SITE,
  {
    // Dimensions
    locationProjectId: { // 1
      type: DataTypes.INTEGER
    },

    // Facts
    name: DataTypes.STRING(255),
    latitude: DataTypes.INTEGER,
    longitude: DataTypes.INTEGER,
    count: DataTypes.INTEGER
  },
  {
    tableName: TABLE_DASHBOARD_DETECTIONS_BY_SITE,
    timestamps: false
  }
)
