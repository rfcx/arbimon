import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { Site } from '../types'

export const MODEL_LOCATION_SITE = 'LocationSite'
export const TABLE_LOCATION_SITE = 'location_site'
export const UPDATE_ON_DUPLICATE_LOCATION_SITE: Array<keyof Site> = ['idCore', 'name', 'latitude', 'longitude', 'altitude']

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
    idArbimon: DataTypes.INTEGER, // 8412

    // Dimensions
    locationProjectId: DataTypes.INTEGER, // 1

    // Facts
    name: DataTypes.STRING(255), // 'CU26'
    latitude: DataTypes.FLOAT, // 18.31307
    longitude: DataTypes.FLOAT, // -65.24878
    altitude: DataTypes.FLOAT // 30.85246588
  },
  {
    tableName: TABLE_LOCATION_SITE
  }
)
