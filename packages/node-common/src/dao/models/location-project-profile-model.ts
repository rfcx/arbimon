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
    image: DataTypes.STRING(1023),
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
    },
    objectives: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    // if null, then there is no date provided for this project
    dateStart: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    // if null, then the project is ongoing
    dateEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    tableName: TABLE_LOCATION_PROJECTS_PROFILE
  }
)
