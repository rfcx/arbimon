import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-helpers/defaults'
import { SpeciesInProject } from '../types-view/species-in-project'

export const MODEL_SPECIES_IN_PROJECT = 'SpeciesInProject'
export const TABLE_SPECIES_IN_PROJECT = 'species_in_project'

export const SpeciesInProjectModel = defineWithDefaults<SpeciesInProject>(
  MODEL_SPECIES_IN_PROJECT,
  {
    // PK
    projectId: { // 1
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

    // FKs
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
    photoUrl: DataTypes.STRING(511)
  },
  {
    tableName: TABLE_SPECIES_IN_PROJECT,
    timestamps: false
  }
)
