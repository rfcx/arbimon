import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { SyncSource } from '../types'

export const MODEL_SYNC_DATA_TYPE = 'SyncDataType'
const TABLE_SYNC_DATA_TYPE = 'sync_data_type'
export const UPDATE_ON_DUPLICATE_SYNC_DATA_TYPE: Array<(keyof SyncSource)> = ['name']

export const SyncDataTypeModel = defineWithDefaultsAutoPk<SyncSource>(
  MODEL_SYNC_DATA_TYPE,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    name: DataTypes.STRING(255)
  },
  {
    tableName: TABLE_SYNC_DATA_TYPE
  }
)
