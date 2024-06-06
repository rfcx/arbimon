import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type SyncStatus } from '../types'

export const MODEL_SYNC_STATUS = 'SyncStatus'
const TABLE_SYNC_STATUS = 'sync_status'

export const SyncStatusModel = defineWithDefaults<SyncStatus>(
  MODEL_SYNC_STATUS,
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

    // Facts
    syncUntilDate: DataTypes.DATE,
    syncUntilId: DataTypes.STRING,
    syncBatchLimit: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
        min: 1
      }
    }
  },
  {
    tableName: TABLE_SYNC_STATUS
  }
)
