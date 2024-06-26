import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type SyncError } from '../types'

export const MODEL_SYNC_ERROR = 'SyncError'
const TABLE_SYNC_ERROR = 'sync_error'

export const SyncErrorModel = defineWithDefaults<SyncError>(
  MODEL_SYNC_ERROR,
  {
    // PK
    syncSourceId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    syncDataTypeId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    externalId: {
      type: DataTypes.STRING(72),
      primaryKey: true
    },

    // Facts
    error: DataTypes.STRING(512)
  },
  {
    tableName: TABLE_SYNC_ERROR
  }
)
