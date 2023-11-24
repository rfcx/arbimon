import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type UserProfile } from '../types'

export const MODEL_USER_PROFILE = 'UserProfile'
const TABLE_USER_PROFILE = 'user_profile'
export const UPDATE_ON_DUPLICATE_USER_PROFILE: Array<(keyof UserProfile)> = ['firstName', 'lastName', 'image', 'organizationIdAffiliated']

export const UserProfileModel = defineWithDefaults<UserProfile>(
  MODEL_USER_PROFILE,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // SKs
    userIdAuth0: {
      type: DataTypes.STRING(255),
      unique: true
    },

    // Facts
    firstName: {
      type: DataTypes.STRING(255)
    },
    lastName: {
      type: DataTypes.STRING(255)
    },
    image: {
      type: DataTypes.STRING(511),
      allowNull: true
    },
    organizationIdAffiliated: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: TABLE_USER_PROFILE,
    timestamps: true
  }
)
