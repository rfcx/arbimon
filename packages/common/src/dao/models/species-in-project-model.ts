import { DataTypes } from 'sequelize'

import { SpeciesInProject } from '../../dao/types/species-in-project'
import { defineWithDefaults } from '../helpers/defaults'

export const MODEL_SPECIES_IN_PROJECT = 'SpeciesInProject'
export const TABLE_SPECIES_IN_PROJECT = 'species_in_project'

export const SPECIES_IN_PROJECT_ATTRIBUTES: Record<string, Array<keyof SpeciesInProject & string>> = {
  light: ['taxonSpeciesId', 'taxonSpeciesSlug', 'scientificName', 'commonName', 'taxonClassSlug']
}

export const SpeciesInProjectModel = defineWithDefaults<SpeciesInProject>(
  MODEL_SPECIES_IN_PROJECT,
  {
    // PK
    locationProjectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // SK
    taxonSpeciesSlug: {
      type: DataTypes.STRING(255),
      unique: true
    },

    // Dimensions
    taxonClassId: DataTypes.INTEGER, // 1
    taxonClassSlug: DataTypes.STRING(255),

    // Facts
    scientificName: DataTypes.STRING(255),
    commonName: DataTypes.STRING(255),
    description: DataTypes.TEXT,
    riskRatingIucnId: DataTypes.INTEGER,
    photoUrl: DataTypes.STRING(511)
  },
  {
    tableName: TABLE_SPECIES_IN_PROJECT,
    timestamps: false
  }
)
