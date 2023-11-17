import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { type Organization, ORGANIZATION_TYPE } from '../types/organization'

export const MODEL_ORGANIZATION = 'Organization'
export const TABLE_ORGANIZATION = 'organization'

export const OrganizationModel = defineWithDefaultsAutoPk<Organization>(
  MODEL_ORGANIZATION,
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...ORGANIZATION_TYPE),
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    tableName: TABLE_ORGANIZATION,
    timestamps: true
  }
)
