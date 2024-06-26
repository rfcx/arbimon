import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type SpeciesInProject } from '../types/species-in-project'

export const MODEL_SPECIES_IN_PROJECT = 'SpeciesInProject'
export const TABLE_SPECIES_IN_PROJECT = 'species_in_project'

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
    sourceUrl: DataTypes.STRING(511),
    sourceCite: DataTypes.STRING(255),
    riskRatingId: DataTypes.INTEGER,
    riskRatingGlobalId: DataTypes.INTEGER,
    riskRatingLocalId: DataTypes.INTEGER,
    photoUrl: DataTypes.STRING(511),
    detectionMinHourLocal: DataTypes.DATE,
    detectionMaxHourLocal: DataTypes.DATE
  },
  {
    tableName: TABLE_SPECIES_IN_PROJECT,
    timestamps: false
  }
)
