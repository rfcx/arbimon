import { DataTypes } from 'sequelize'

import { defineWithDefaultsNoPk } from '../model-factory-helpers/defaults'
import { SyncStatus } from '../types'

export const MODEL_SYNC_STATUS = 'SyncStatus'
const TABLE_SYNC_STATUS = 'sync_status'

export const SyncStatusModel = defineWithDefaultsNoPk<SyncStatus>(
  MODEL_SYNC_STATUS,
  {
    // PK
    syncSourceId: { // 1
      type: DataTypes.INTEGER
    },
    syncDataTypeId: { // 1
      type: DataTypes.INTEGER
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
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: TABLE_SYNC_STATUS
  }
)
