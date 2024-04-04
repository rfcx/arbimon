import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { type Site } from '../types'

export const MODEL_LOCATION_SITE = 'LocationSite'
export const TABLE_LOCATION_SITE = 'location_site'
export const UPDATE_ON_DUPLICATE_LOCATION_SITE: Array<keyof Site> = ['idCore', 'locationProjectId', 'name', 'latitude', 'longitude', 'altitude', 'updatedAt', 'countryCode', 'hidden']

export const LocationSiteModel = defineWithDefaultsAutoPk<Site>(
  MODEL_LOCATION_SITE,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    idCore: DataTypes.STRING(12), // MoLQA8aNulGb
    idArbimon: { // 8412
      type: DataTypes.INTEGER,
      unique: true
    },

    // Dimensions
    locationProjectId: DataTypes.INTEGER, // 1

    // Facts
    name: DataTypes.STRING(255), // 'CU26'
    latitude: { // 18.31307
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: { // -65.24878
      type: DataTypes.FLOAT,
      allowNull: true
    },
    altitude: { // 30.85246588,
      type: DataTypes.FLOAT,
      allowNull: true
    },
    countryCode: {
      type: DataTypes.STRING(2),
      allowNull: true,
      defaultValue: null
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: TABLE_LOCATION_SITE
  }
)
