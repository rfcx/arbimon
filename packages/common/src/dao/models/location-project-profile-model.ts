import { DataTypes } from 'sequelize'

import { LocationProjectProfile } from '../../dao/types/location-project-profile'
import { defineWithDefaults } from '../helpers/defaults'

export const MODEL_LOCATION_PROJECT_PROFILE = 'LocationProjectProfile'
export const TABLE_LOCATION_PROJECTS_PROFILE = 'location_project_profile'

export const LocationProjectProfileModel = defineWithDefaults<LocationProjectProfile>(
  MODEL_LOCATION_PROJECT_PROFILE,
  {
    // PK
    locationProjectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    summary: DataTypes.STRING(1023),
    readme: DataTypes.TEXT
  },
  {
    tableName: TABLE_LOCATION_PROJECTS_PROFILE
  }
)
