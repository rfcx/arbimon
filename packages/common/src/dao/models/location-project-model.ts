import { DataTypes } from 'sequelize'

import { Project } from '../../dao/types'
import { defineWithDefaultsAutoPk } from '../helpers/defaults'
import { TABLE_LOCATION_PROJECTS } from '../table-names'

export const ProjectModel = defineWithDefaultsAutoPk<Project>(
  'LocationProject',
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    idCore: DataTypes.STRING(12), // ???
    idArbimon: DataTypes.INTEGER, // ???
    slug: { // puerto-rico-island-wide
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
    tableName: TABLE_LOCATION_PROJECTS
  }
)
