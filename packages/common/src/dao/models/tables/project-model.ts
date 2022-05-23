import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { Project } from '../../types'

export const MODEL_PROJECT = 'Project'
const TABLE_PROJECT = 'project'
export const UPDATE_ON_DUPLICATE_PROJECT: Array<keyof Project> = ['name', 'slug', 'idCore']

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

    // Facts
    name: DataTypes.STRING(255) // Puerto Rico Island-Wide
  },
  {
    tableName: TABLE_PROJECT
  }
)
