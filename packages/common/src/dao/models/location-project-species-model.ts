import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { LocationProjectSpecies } from '../types/location-project-species'

export const MODEL_LOCATION_PROJECT_SPECIES = 'LocationProjectSpecies'
export const TABLE_LOCATION_PROJECT_SPECIES = 'location_project_species'

export const LocationProjectSpeciesModel = defineWithDefaults<LocationProjectSpecies>(
  MODEL_LOCATION_PROJECT_SPECIES,
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

    // Facts
    highlightedOrder: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    riskRatingLocalLevel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    riskRatingLocalCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    riskRatingLocalSource: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    tableName: TABLE_LOCATION_PROJECT_SPECIES
  }
)
