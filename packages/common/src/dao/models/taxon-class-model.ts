import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { TaxonClass } from '../types'

export const MODEL_TAXON_CLASS = 'TaxonClass'
export const TABLE_TAXON_CLASS = 'taxon_class'
export const UPDATE_ON_DUPLICATE_TAXON_CLASS: Array<(keyof TaxonClass)> = ['slug', 'commonName', 'updatedAt']

export const TaxonClassModel = defineWithDefaults<TaxonClass>(
  MODEL_TAXON_CLASS,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // SKs
    idArbimon: DataTypes.INTEGER, // ???
    slug: { // birds
      type: DataTypes.STRING(255),
      unique: true
    },

    // Facts
    commonName: DataTypes.STRING(255) // Birds
  },
  {
    tableName: TABLE_TAXON_CLASS
  }
)
