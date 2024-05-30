import { type Optional, DataTypes } from 'sequelize'

import { type ModelForInterface, defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { type SyncLogByProject } from '../types'

export const MODEL_SYNC_LOG_BY_PROJECT = 'SyncLogByProject'
const TABLE_SYNC_LOG_BY_PROJECT = 'sync_log_by_project'

export const SyncLogByProjectModel = defineWithDefaultsAutoPk<SyncLogByProject, ModelForInterface<SyncLogByProject, Optional<SyncLogByProject, 'id' | 'createdAt' | 'updatedAt'>>>(
  MODEL_SYNC_LOG_BY_PROJECT,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Logging
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,

    // FKs
    locationProjectId: DataTypes.INTEGER, // 1
    syncSourceId: DataTypes.INTEGER, // 1
    syncDataTypeId: DataTypes.INTEGER, // 1

    // Facts
    delta: DataTypes.INTEGER // +10
  },
  {
    tableName: TABLE_SYNC_LOG_BY_PROJECT
  }
)
