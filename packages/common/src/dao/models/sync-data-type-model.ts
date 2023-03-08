import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type SyncDataType } from '../types'

export const MODEL_SYNC_DATA_TYPE = 'SyncDataType'
const TABLE_SYNC_DATA_TYPE = 'sync_data_type'
export const UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE: Array<(keyof SyncDataType)> = ['name', 'updatedAt']

export const SyncDataTypeModel = defineWithDefaults<SyncDataType>(
  MODEL_SYNC_DATA_TYPE,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    name: {
      type: DataTypes.STRING(255),
      unique: true
    }
  },
  {
    tableName: TABLE_SYNC_DATA_TYPE
  }
)
