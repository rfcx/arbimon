import { DataTypes } from 'sequelize'

import { TaxonSpecies } from '../../dao/types'
import { defineWithDefaultsAutoPk } from '../helpers/defaults'
import { TABLE_TAXON_SPECIES } from '../table-names'

export const TaxonSpeciesModel = defineWithDefaultsAutoPk<TaxonSpecies>(
  'TaxonSpecies',
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    idArbimon: DataTypes.INTEGER, // ???
    slug: { // accipiter-striatus-venator
      type: DataTypes.STRING(255),
      unique: true
    },

    // Dimensions
    taxonClassId: DataTypes.INTEGER, // 1

    // Facts
    scientificName: DataTypes.STRING(255) // Accipiter striatus venator
  },
  {
    tableName: TABLE_TAXON_SPECIES
  }
)
