import { DataTypes, Optional } from 'sequelize'

import { defineWithDefaults, ModelForInterface } from '../../model-helpers/defaults'
import { SourceSync } from '../../types'

export const MODEL_SOURCE_SYNC = 'SourceSync'
const TABLE_SOURCE_SYNC = 'source_sync'

export const SourceSyncModel = defineWithDefaults<SourceSync, ModelForInterface<SourceSync, Optional<SourceSync, 'createdAt' | 'updatedAt'>>>(
  MODEL_SOURCE_SYNC,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SK
    // Composite SK: hash + projectId + sourceId
    hash: DataTypes.STRING(255),
    projectId: DataTypes.INTEGER, // 1
    sourceId: DataTypes.INTEGER, // 1

    // Logging
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,

    // Facts
    summaryText: DataTypes.JSON
  },
  {
    tableName: TABLE_SOURCE_SYNC
  }
)
