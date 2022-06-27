import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { SyncLogByProject } from '../types'

export const MODEL_SYNC_LOG_BY_PROJECT = 'SyncLogByProject'
const TABLE_SYNC_LOG_BY_PROJECT = 'sync_log_by_project'

export const SyncLogByProjectModel = defineWithDefaultsAutoPk<SyncLogByProject>(
  MODEL_SYNC_LOG_BY_PROJECT,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // FKs
    projectId: DataTypes.INTEGER, // 1
    syncSourceId: DataTypes.INTEGER, // 1
    syncDataTypeId: DataTypes.INTEGER, // 1

    // Facts
    delta: DataTypes.INTEGER // +10
  },
  {
    tableName: TABLE_SYNC_LOG_BY_PROJECT
  }
)
