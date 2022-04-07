import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { Site } from '../../types'

export const MODEL_PROJECT_SITE = 'ProjectSite'
const TABLE_PROJECT_SITE = 'project_site'

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
    idCore: { // MoLQA8aNulGb
      type: DataTypes.STRING(12)
      // unique: true
    },
    idArbimon: { // 8412
      type: DataTypes.INTEGER,
      unique: true
     },

    // FKs
    projectId: DataTypes.INTEGER, // 1
    projectVersionFirstDetectionId: DataTypes.INTEGER, // 123

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
