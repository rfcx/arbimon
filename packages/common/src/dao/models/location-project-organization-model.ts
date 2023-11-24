import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type LocationProjectOrganization } from '../types/location-project-organization'

export const MODEL_LOCATION_PROJECT_ORGANIZATION = 'LocationProjectOrganization'
export const TABLE_LOCATION_PROJECT_ORGANIZATION = 'location_project_organization'

export const LocationProjectOrganizationModel = defineWithDefaults<LocationProjectOrganization>(
  MODEL_LOCATION_PROJECT_ORGANIZATION,
  {
    locationProjectId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'location_project',
        key: 'id'
      }
    },
    organizationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'organization',
        key: 'id'
      }
    }
  },
  {
    timestamps: true,
    tableName: TABLE_LOCATION_PROJECT_ORGANIZATION
  }
)
