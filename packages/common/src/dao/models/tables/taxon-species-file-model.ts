import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesFile } from '../../types'

export const MODEL_TAXON_SPECIES_FILE = 'TaxonSpeciesProjectFile'
const TABLE_TAXON_SPECIES_FILE = 'taxon_species_project_file'

export const TaxonSpeciesFileModel = defineWithDefaults<TaxonSpeciesFile>(
  MODEL_TAXON_SPECIES_FILE,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    taxonSpeciesSourceId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    order: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    fileUrl: DataTypes.STRING(511),
    filename: DataTypes.STRING(255),
    mimeType: DataTypes.STRING(32),
    description: DataTypes.STRING(255)
  },
  {
    tableName: TABLE_TAXON_SPECIES_FILE
  }
)
