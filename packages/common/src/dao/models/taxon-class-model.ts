import { ModelFactory } from 'dao/helpers/types'
import { DataTypes } from 'sequelize'

import { TaxonClass } from '../../domain'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_TAXON_CLASSES } from '../table-names'

export const TaxonClassModel: ModelFactory<TaxonClass> = sequelize => defineWithDefaults(
  sequelize,
  'TaxonClass',
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    idArbimon: DataTypes.INTEGER, // ???
    slug: { // birds
      type: DataTypes.STRING(255),
      unique: true
    },

    // Facts
    name: DataTypes.STRING(255), // Birds
    symbol: DataTypes.STRING(1), // 🐦
    color: DataTypes.STRING(10) // #E043A9
  },
  {
    tableName: TABLE_TAXON_CLASSES
  }
)
