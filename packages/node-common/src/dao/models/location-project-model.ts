import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { type Project, PROJECT_ENTITLEMENT_STATE_ORDERED, PROJECT_STATUS_ORDERED, PROJECT_TYPE_ORDERED } from '../types'

export const MODEL_LOCATION_PROJECT = 'LocationProject'
export const TABLE_LOCATION_PROJECT = 'location_project'
export const UPDATE_ON_DUPLICATE_LOCATION_PROJECT: Array<keyof Project> = [
  'name',
  'slug',
  'idCore',
  'latitudeNorth',
  'latitudeSouth',
  'longitudeEast',
  'longitudeWest',
  'projectType',
  'entitlementState',
  'entitlementUpdatedAt',
  'entitlementInactivatedReason',
  'downgradeLocked',
  'viewOnlyEffective',
  'updatedAt'
]

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

    // Facts
    name: DataTypes.STRING(255), // Puerto Rico Island-Wide
    status: {
      type: DataTypes.ENUM(...PROJECT_STATUS_ORDERED),
      allowNull: false
    },
    statusUpdatedAt: DataTypes.DATE,
    latitudeNorth: DataTypes.FLOAT, // 18.51375
    latitudeSouth: DataTypes.FLOAT, // 17.93168
    longitudeEast: DataTypes.FLOAT, // -65.24505
    longitudeWest: DataTypes.FLOAT, // -67.94469784
    projectType: {
      type: DataTypes.ENUM(...PROJECT_TYPE_ORDERED),
      allowNull: true
    },
    entitlementState: {
      type: DataTypes.ENUM(...PROJECT_ENTITLEMENT_STATE_ORDERED),
      allowNull: true,
      defaultValue: 'active'
    },
    entitlementUpdatedAt: DataTypes.DATE,
    entitlementInactivatedReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    downgradeLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    viewOnlyEffective: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: TABLE_LOCATION_PROJECT,
    paranoid: true
  }
)
