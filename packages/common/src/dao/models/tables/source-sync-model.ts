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

    // Logging
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,

    // SKs
    hash: { // 1239eb4a8416af46c0448426b51771f5
      type: DataTypes.STRING(255),
      unique: true
    },

    // FKs
    projectId: DataTypes.INTEGER, // 1
    sourceId: DataTypes.INTEGER, // 1

    // Facts
    summaryText: DataTypes.JSON
  },
  {
    tableName: TABLE_SOURCE_SYNC
  }
)
