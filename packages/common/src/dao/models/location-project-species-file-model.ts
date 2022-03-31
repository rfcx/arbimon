import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { TaxonSpeciesProjectFile } from '../types'

export const MODEL_TAXON_SPECIES_PROJECT_FILE = 'TaxonSpeciesProjectFile'
export const TABLE_TAXON_SPECIES_PROJECT_FILE = 'taxon_species_project_file'

export const TaxonSpeciesProjectFileModel = defineWithDefaults<TaxonSpeciesProjectFile>(
  MODEL_TAXON_SPECIES_PROJECT_FILE,
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
    tableName: TABLE_TAXON_SPECIES_PROJECT_FILE
  }
)
