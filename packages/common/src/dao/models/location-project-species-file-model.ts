import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { LocationProjectSpeciesFile } from '../types'

export const MODEL_LOCATION_PROJECT_SPECIES_FILE = 'LocationProjectSpeciesFile'
export const TABLE_LOCATION_PROJECT_SPECIES_FILE = 'location_project_species_file'

export const LocationProjectSpeciesFileModel = defineWithDefaults<LocationProjectSpeciesFile>(
  MODEL_LOCATION_PROJECT_SPECIES_FILE,
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
    order: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    description: DataTypes.STRING(255),
    filename: DataTypes.STRING(255),
    mimeType: DataTypes.STRING(32),
    url: DataTypes.STRING(511)
  },
  {
    tableName: TABLE_LOCATION_PROJECT_SPECIES_FILE
  }
)
