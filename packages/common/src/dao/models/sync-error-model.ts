import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { SyncError } from '../types'

export const MODEL_SYNC_ERROR = 'SyncError'
const TABLE_SYNC_ERROR = 'sync_error'

export const SyncErrorModel = defineWithDefaults<SyncError>(
  MODEL_SYNC_ERROR,
  {
    // PK
    sourceId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    syncDataTypeId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    externalId: DataTypes.STRING(255),
    error: DataTypes.STRING(255)
  },
  {
    tableName: TABLE_SYNC_ERROR
  }
)
