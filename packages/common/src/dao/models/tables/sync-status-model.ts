import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { SyncStatus } from '../../types'

export const MODEL_SYNC_STATUS = 'SyncStatus'
const TABLE_SYNC_STATUS = 'sync_status'

export const SyncStatusModel = defineWithDefaultsAutoPk<SyncStatus>(
  MODEL_SYNC_STATUS,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // FKs
    sourceId: DataTypes.INTEGER, // 1
    syncDataTypeId: DataTypes.INTEGER, // 1

    // Facts
    syncUntilDate: DataTypes.DATE
  },
  {
    tableName: TABLE_SYNC_STATUS
  }
)
