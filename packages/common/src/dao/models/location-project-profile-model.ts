import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type LocationProjectProfile } from '../types/location-project-profile'

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
    readme: DataTypes.TEXT,
    methods: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    keyResult: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    resources: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    }
  },
  {
    tableName: TABLE_LOCATION_PROJECTS_PROFILE
  }
)
