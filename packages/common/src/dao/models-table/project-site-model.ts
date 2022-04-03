import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { Site } from '../types'

export const MODEL_PROJECT_SITE = 'ProjectSite'
export const TABLE_PROJECT_SITE = 'project_site'

export const ProjectSiteModel = defineWithDefaultsAutoPk<Site>(
  MODEL_PROJECT_SITE,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    idCore: DataTypes.STRING(12), // MoLQA8aNulGb
    idArbimon: DataTypes.INTEGER, // 8412

    // FKs
    projectId: DataTypes.INTEGER, // 1

    // Facts
    name: DataTypes.STRING(255), // 'CU26'
    latitude: DataTypes.FLOAT, // 18.31307
    longitude: DataTypes.FLOAT, // -65.24878
    altitude: DataTypes.FLOAT // 30.85246588
  },
  {
    tableName: TABLE_PROJECT_SITE
  }
)
