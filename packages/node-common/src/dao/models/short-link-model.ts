import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { type ShortLink } from '../types/short-link'

export const MODEL_SHORT_LINK = 'ShortLink'
export const TABLE_SHORT_LINK = 'short_link'

export const ShortLinkModel = defineWithDefaultsAutoPk<ShortLink>(
  MODEL_SHORT_LINK,
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    namespace: {
      type: DataTypes.STRING
    },
    slug: {
      type: DataTypes.STRING
    },
    kind: {
      type: DataTypes.STRING
    },
    targetBucket: {
      type: DataTypes.STRING,
      allowNull: true
    },
    targetKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    targetUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    maxAccesses: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    accessCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: TABLE_SHORT_LINK,
    timestamps: false
  }
)
