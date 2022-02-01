import { ModelFactory } from 'dao/helpers/types'
import { DataTypes } from 'sequelize'

import { Project } from '../../domain'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_LOCATION_PROJECTS } from '../table-names'

export const ProjectModel: ModelFactory<Project> = sequelize => defineWithDefaults(
  sequelize,
  'LocationProject',
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    slug: { // puerto-rico-island-wide
      type: DataTypes.STRING(255),
      unique: true
    },

    // External
    idCore: DataTypes.STRING(12), // ???
    idArbimon: DataTypes.INTEGER, // ???

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
