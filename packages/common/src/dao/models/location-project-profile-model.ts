import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { ProjectProfile } from '../types/location-project-profile'

export const MODEL_PROJECT_PROFILE = 'ProjectProfile'
export const TABLE_PROJECT_PROFILE = 'project_profile'

export const ProjectProfileModel = defineWithDefaults<ProjectProfile>(
  MODEL_PROJECT_PROFILE,
  {
    // PK
    projectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    summary: DataTypes.STRING(1023),
    readme: DataTypes.TEXT
  },
  {
    tableName: TABLE_PROJECT_PROFILE
  }
)
