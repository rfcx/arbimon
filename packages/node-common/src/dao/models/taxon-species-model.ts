import { DataTypes } from 'sequelize'

import { defineWithDefaultsAutoPk } from '../model-factory-helpers/defaults'
import { type TaxonSpecies } from '../types'

export const MODEL_TAXON_SPECIES = 'TaxonSpecies'
export const TABLE_TAXON_SPECIES = 'taxon_species'
export const UPDATE_ON_DUPLICATE_TAXON_SPECIES: Array<keyof TaxonSpecies> = ['scientificName', 'slug', 'taxonClassId', 'updatedAt']

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
    idArbimon: {
      type: DataTypes.INTEGER,
      unique: true
    },

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
