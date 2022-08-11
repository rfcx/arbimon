import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { SyncSource } from '../types'

export const MODEL_SYNC_SOURCE = 'SyncSource'
const TABLE_SYNC_SOURCE = 'sync_source'
export const UPDATE_ON_DUPLICATE_SYNC_SOURCE: Array<(keyof SyncSource)> = ['name']

export const SyncSourceModel = defineWithDefaults<SyncSource>(
  MODEL_SYNC_SOURCE,
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
    tableName: TABLE_SYNC_SOURCE
  }
)
