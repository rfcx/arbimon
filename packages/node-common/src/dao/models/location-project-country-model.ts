import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type LocationProjectCountry } from '../types/location-project-country'

export const MODEL_LOCATION_PROJECT_COUNTRY = 'LocationProjectCountry'
export const TABLE_LOCATION_PROJECT_COUNTRY = 'location_project_country'

export const LocationProjectCountryModel = defineWithDefaults<LocationProjectCountry>(
  MODEL_LOCATION_PROJECT_COUNTRY,
  {
    // PK
    locationProjectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    countryCodes: DataTypes.ARRAY(DataTypes.STRING)
  },
  {
    tableName: TABLE_LOCATION_PROJECT_COUNTRY,
    timestamps: false
  }
)
