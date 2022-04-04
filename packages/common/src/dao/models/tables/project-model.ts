import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { Project } from '../../types'

export const MODEL_PROJECT = 'Project'
export const TABLE_PROJECT = 'project'

export const ProjectModel = defineWithDefaultsAutoPk<Project>(
  MODEL_PROJECT,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    idCore: {
      type: DataTypes.STRING(12) // rbj7k70v4na7
      // unique: true,
    },
    idArbimon: { // 1989
      type: DataTypes.INTEGER,
      unique: true
    },
    slug: { // puerto-rico-island-wide
      type: DataTypes.STRING(255),
      unique: true
    },
    slugArbimon: { // fake-arbimon-project-for-bio
      type: DataTypes.STRING(255),
      unique: true
    },

    // Facts
    name: DataTypes.STRING(255), // Puerto Rico Island-Wide
    latitudeNorth: DataTypes.FLOAT, // 18.51375
    latitudeSouth: DataTypes.FLOAT, // 17.93168
    longitudeEast: DataTypes.FLOAT, // -65.24505
    longitudeWest: DataTypes.FLOAT // -67.94469784
  },
  {
    tableName: TABLE_PROJECT
  }
)
