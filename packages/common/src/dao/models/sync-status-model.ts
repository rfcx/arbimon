import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { SyncStatus } from '../types'

export const MODEL_SYNC_STATUS = 'SyncStatus'
const TABLE_SYNC_STATUS = 'sync_status'

export const SyncStatusModel = defineWithDefaults<SyncStatus>(
  MODEL_SYNC_STATUS,
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
    syncUntilDate: DataTypes.DATE,
    syncUntilId: DataTypes.INTEGER,
    syncBatchLimit: DataTypes.INTEGER
  },
  {
    tableName: TABLE_SYNC_STATUS
  }
)
