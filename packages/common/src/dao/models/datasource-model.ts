import { DataTypes, Optional } from 'sequelize'

import { DataSource } from '@/dao/types'
import { defineWithDefaults, ModelForInterface } from '../helpers/defaults'

export const MODEL_DATASOURCE = 'DataSource'
export const TABLE_MODEL_DATASOURCE = 'data_source'

export const DataSourceModel = defineWithDefaults<DataSource, ModelForInterface<DataSource, Optional<DataSource, 'createdAt' | 'updatedAt'>>>(
  MODEL_DATASOURCE,
  {
    // PK
    id: { // 1239eb4a8416af46c0448426b51771f5
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    locationProjectId: {
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
    tableName: TABLE_MODEL_DATASOURCE
  }
)
