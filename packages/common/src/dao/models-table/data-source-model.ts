import { DataTypes, Optional } from 'sequelize'

import { DataSource } from '@/dao/types'
import { defineWithDefaults, ModelForInterface } from '../model-factory-helpers/defaults'

export const MODEL_DATA_SOURCE = 'DataSource'
export const TABLE_MODEL_DATA_SOURCE = 'data_source'

export const DataSourceModel = defineWithDefaults<DataSource, ModelForInterface<DataSource, Optional<DataSource, 'createdAt' | 'updatedAt'>>>(
  MODEL_DATA_SOURCE,
  {
    // PK
    id: { // 1239eb4a8416af46c0448426b51771f5
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    projectId: {
      type: DataTypes.INTEGER, // 1
      primaryKey: true
    },
    // Logging
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    // Facts
    summaryText: DataTypes.JSON
  },
  {
    tableName: TABLE_MODEL_DATA_SOURCE
  }
)
