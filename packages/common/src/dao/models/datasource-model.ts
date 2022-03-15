import { DataTypes } from 'sequelize'

import { Datasource } from '@/dao/types'
import { defineWithDefaults } from '../helpers/defaults'

export const MODEL_DATASOURCE = 'Datasource'
export const TABLE_MODEL_DATASOURCE = 'datasource'

export const DatasourceModel = defineWithDefaults<Datasource>(
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
    updatedAt: DataTypes.DATE,
    // Facts
    summaryText: DataTypes.JSON
  },
  {
    tableName: TABLE_MODEL_DATASOURCE
  }
)
