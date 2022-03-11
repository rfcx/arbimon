import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../helpers/defaults'
import { Datasource } from '../types/datasource'

export const MODEL_DATASOURCE = 'Datasource'
export const TABLE_MODEL_DATASOURCE = 'datasource'

export const DatasourceModel = defineWithDefaults<Omit<Datasource, 'createdAt' | 'updatedAt'>>(
  MODEL_DATASOURCE,
  {
    // PK
    id: { // 1239eb4a8416af46c0448426b51771f5
      type: DataTypes.STRING(255),
      primaryKey: true
    },

    // Dimensions
    locationProjectId: DataTypes.INTEGER, // 1

    summaryText: {
      type: DataTypes.JSON
    }
  },
  {
    tableName: TABLE_MODEL_DATASOURCE
  }
)
