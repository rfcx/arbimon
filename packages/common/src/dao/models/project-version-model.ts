import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { ProjectVersion } from '../types'

export const MODEL_PROJECT_VERSION = 'ProjectVersion'
export const TABLE_PROJECT_VERSION = 'project_version'
export const UPDATE_ON_DUPLICATE_LOCATION_PROJECT_VERSION: Array<keyof ProjectVersion> = ['isPublished', 'isPublic']

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
    locationProjectId: DataTypes.INTEGER, // 1
    // Facts
    isPublished: DataTypes.BOOLEAN, // false for latest sync
    isPublic: DataTypes.BOOLEAN // true
  },
  {
    tableName: TABLE_PROJECT_VERSION
  }
)
