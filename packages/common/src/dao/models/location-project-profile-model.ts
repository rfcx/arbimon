import { DataTypes } from 'sequelize'

import { ProjectProfile } from '../../dao/types/location-project-profile'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_LOCATION_PROJECTS_PROFILE } from '../table-names'

export const LocationProjectProfileModel = defineWithDefaults<ProjectProfile>(
  'LocationProjectProfile',
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
