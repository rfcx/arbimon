import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { DashboardDetectionBySite } from '../../types'

export const MODEL_DASHBOARD_DETECTION_BY_SITE = 'DashboardDetectionBySite'
export const TABLE_DASHBOARD_DETECTION_BY_SITE = 'dashboard_detection_by_site'

export const DashboardDetectionBySiteModel = defineWithDefaults<DashboardDetectionBySite>(
  MODEL_DASHBOARD_DETECTION_BY_SITE,
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
    count: DataTypes.INTEGER
  },
  {
    tableName: TABLE_DASHBOARD_DETECTION_BY_SITE
  }
)
