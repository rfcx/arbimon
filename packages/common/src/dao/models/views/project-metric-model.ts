import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { ProjectMetric } from '../../types'

export const MODEL_PROJECT_METRIC = 'ProjectMetric'
export const TABLE_PROJECT_METRIC = 'project_metric'

export const ProjectMetricModel = defineWithDefaults<ProjectMetric>(
  MODEL_PROJECT_METRIC,
  {
    // PK
    projectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    detectionCount: DataTypes.INTEGER, // 45,000
    siteCount: DataTypes.INTEGER, // 850
    speciesCount: DataTypes.INTEGER, // 94
    maxDate: DataTypes.DATE,
    minDate: DataTypes.DATE
  },
  {
    tableName: TABLE_PROJECT_METRIC,
    timestamps: false
  }
)
