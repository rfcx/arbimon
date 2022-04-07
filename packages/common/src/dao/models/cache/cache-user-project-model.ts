import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { CacheUserProject } from '../../types'

export const MODEL_CACHE_USER_PROJECT = 'CacheUserProject'
export const TABLE_CACHE_USER_PROJECT = 'cache_user_project'

export const CacheUserProjectModel = defineWithDefaults<CacheUserProject>(
  MODEL_CACHE_USER_PROJECT,
  {
    // PK
    userIdAuth0: { // auth0|abc
      type: DataTypes.STRING,
      primaryKey: true
    },
    // Facts
    projectCoreIds: DataTypes.ARRAY(DataTypes.STRING(255)),
    expiredAt: DataTypes.DATE
  },
  {
    tableName: TABLE_CACHE_USER_PROJECT
  }
)
