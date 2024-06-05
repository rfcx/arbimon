import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type LocationProjectUserRole } from '../types'

export const MODEL_LOCATION_PROJECT_USER_ROLE = 'LocationProjectUserRole'
export const TABLE_LOCATION_PROJECT_USER_ROLE = 'location_project_user_role'

export const LocationProjectUserRoleModel = defineWithDefaults<LocationProjectUserRole>(
  MODEL_LOCATION_PROJECT_USER_ROLE,
  {
    locationProjectId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'location_project',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user_profile',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false
    },
    ranking: {
      type: DataTypes.INTEGER,
      defaultValue: -1,
      allowNull: false
    }
  },
  {
    timestamps: true,
    tableName: TABLE_LOCATION_PROJECT_USER_ROLE
  }
)
