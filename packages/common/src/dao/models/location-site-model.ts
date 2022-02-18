import { DataTypes } from 'sequelize'

import { Site } from '../../dao/types'
import { defineWithDefaultsAutoPk } from '../helpers/defaults'

export const MODEL_LOCATION_SITE = 'LocationSite'
export const TABLE_LOCATION_SITE = 'location_site'

export const SITE_MODEL_ATTRIBUTES: Record<string, Array<keyof Site>> = {
  light: ['id', 'name', 'latitude', 'longitude', 'altitude']
}

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
