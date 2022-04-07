import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../../model-helpers/defaults'
import { TaxonSpecies } from '../../types'

export const MODEL_TAXON_SPECIES = 'TaxonSpecies'
const TABLE_TAXON_SPECIES = 'taxon_species'

export const TaxonSpeciesModel = defineWithDefaultsAutoPk<TaxonSpecies>(
  MODEL_TAXON_SPECIES,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    idArbimon: { // ???
      type: DataTypes.INTEGER,
      unique: true
    },
    slug: { // accipiter-striatus-venator
      type: DataTypes.STRING(255),
      unique: true
    },

    // FKs
    taxonClassId: DataTypes.INTEGER, // 1

    // Facts
    scientificName: DataTypes.STRING(255) // Accipiter striatus venator
  },
  {
    tableName: TABLE_TAXON_SPECIES
  }
)
