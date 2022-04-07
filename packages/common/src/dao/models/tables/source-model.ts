import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { Source } from '../../types'

export const MODEL_SOURCE = 'Source'
const TABLE_SOURCE = 'source'
export const UPDATE_ON_DUPLICATE_SOURCE: Array<(keyof Source)> = ['name']

export const SourceModel = defineWithDefaultsAutoPk<Source>(
  MODEL_SOURCE,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Facts
    name: DataTypes.STRING(255)
  },
  {
    tableName: TABLE_SOURCE
  }
)
