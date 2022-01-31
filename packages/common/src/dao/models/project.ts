import { ModelFactory } from 'dao/helpers/types'
import { DataTypes } from 'sequelize'

import { Project } from '../../api-bio/common/projects'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_PROJECTS } from '../table-names'

export const ProjectDao: ModelFactory<Project> = sequelize => defineWithDefaults(
  sequelize,
  'Project',
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // External
    idCore: DataTypes.STRING(12), // ???
    idArbimon: DataTypes.INTEGER, // ???
    // Facts
    slug: DataTypes.STRING(255), // puerto-rico-island-wide
    name: DataTypes.STRING(255), // Puerto Rico Island-Wide
    latitudeNorth: DataTypes.FLOAT, // 18.51375
    latitudeSouth: DataTypes.FLOAT, // 17.93168
    longitudeEast: DataTypes.FLOAT, // -65.24505
    longitudeWest: DataTypes.FLOAT // -67.94469784
  },
  {
    tableName: TABLE_PROJECTS
  }
)
