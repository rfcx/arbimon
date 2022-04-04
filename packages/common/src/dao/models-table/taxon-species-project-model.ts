import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-helpers/defaults'
import { TaxonSpeciesProject } from '../types/location-project-species'

export const MODEL_TAXON_SPECIES_PROJECT = 'TaxonSpeciesProject'
export const TABLE_TAXON_SPECIES_PROJECT = 'taxon_species_project'

export const TaxonSpeciesProjectModel = defineWithDefaults<TaxonSpeciesProject>(
  MODEL_TAXON_SPECIES_PROJECT,
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
    tableName: TABLE_TAXON_SPECIES_PROJECT
  }
)
