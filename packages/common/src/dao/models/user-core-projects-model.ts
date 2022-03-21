import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { UserCoreProjects } from '../types'

export const MODEL_USER_CORE_PROJECTS = 'UserCoreProjects'
export const TABLE_USER_CORE_PROJECTS = 'user_core_projects'

export const UserCoreProjectsModel = defineWithDefaults<UserCoreProjects>(
  MODEL_USER_CORE_PROJECTS,
  {
    // PK
    userId: { // 1
      type: DataTypes.STRING,
      primaryKey: true
    },
    // Facts
    projectCoreIds: {
      type: DataTypes.ARRAY(DataTypes.STRING(255)),
      allowNull: false
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: TABLE_USER_CORE_PROJECTS
  }
)
