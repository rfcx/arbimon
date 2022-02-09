import { DataTypes } from 'sequelize'

import { TaxonClass } from '../../dao/types'
import { defineWithDefaultsAutoPk } from '../helpers/defaults'
import { TABLE_TAXON_CLASSES } from '../table-names'

export const TaxonClassModel = defineWithDefaultsAutoPk<TaxonClass>(
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
    commonName: DataTypes.STRING(255) // Birds
  },
  {
    tableName: TABLE_TAXON_CLASSES
  }
)
