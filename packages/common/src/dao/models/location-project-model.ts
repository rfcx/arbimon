import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { Project } from '../types'

export const MODEL_LOCATION_PROJECT = 'LocationProject'
export const TABLE_LOCATION_PROJECT = 'location_project'
export const UPDATE_ON_DUPLICATE_PROJECT: Array<keyof Project> = ['name', 'slug', 'idCore']

export const LocationProjectModel = defineWithDefaultsAutoPk<Project>(
  MODEL_LOCATION_PROJECT,
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
    tableName: TABLE_LOCATION_PROJECT
  }
)
