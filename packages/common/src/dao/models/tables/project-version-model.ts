import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { ProjectVersion } from '../../types'

export const MODEL_PROJECT_VERSION = 'ProjectVersion'
const TABLE_PROJECT_VERSION = 'project_version'

export const ProjectVersionModel = defineWithDefaultsAutoPk<ProjectVersion>(
  MODEL_PROJECT_VERSION,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // FKs
    projectId: DataTypes.INTEGER, // 1

    // Facts
    isPublished: { // false for latest sync
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPublic: { // true
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: TABLE_PROJECT_VERSION
  }
)
