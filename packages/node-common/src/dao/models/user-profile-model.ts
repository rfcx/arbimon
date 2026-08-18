import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { type UserProfile, ACCOUNT_TIER_ORDERED } from '../types'

export const MODEL_USER_PROFILE = 'UserProfile'
const TABLE_USER_PROFILE = 'user_profile'
export const UPDATE_ON_DUPLICATE_USER_PROFILE: Array<(keyof UserProfile)> = [
  'firstName',
  'lastName',
  'image',
  'organizationIdAffiliated',
  'accountTier',
  'accountTierUpdatedAt',
  'additionalPremiumProjectSlots',
  // Must be listed here or an upsert silently drops a user's saved formats.
  'timestampFormats'
]

export const UserProfileModel = defineWithDefaultsAutoPk<UserProfile>(
  MODEL_USER_PROFILE,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    email: {
      type: DataTypes.STRING(255),
      unique: true
    },
    idAuth0: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    },
    accountTier: {
      type: DataTypes.ENUM(...ACCOUNT_TIER_ORDERED),
      allowNull: true
    },
    accountTierUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    additionalPremiumProjectSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Saved custom filename timestamp formats (migration
    // 260818-01-user-timestamp-formats). NOT NULL with a [] default so readers
    // never handle NULL; order is semantic (first match wins).
    timestampFormats: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    }
  },
  {
    tableName: TABLE_USER_PROFILE,
    timestamps: true
  }
)
