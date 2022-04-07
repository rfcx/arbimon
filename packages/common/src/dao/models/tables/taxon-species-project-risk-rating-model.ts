import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesProjectRiskRating } from '../../types'

export const MODEL_TAXON_SPECIES_PROJECT_RISK_RATING = 'TaxonSpeciesProjectRiskRating'
const TABLE_TAXON_SPECIES_PROJECT_RISK_RATING = 'taxon_species_project_risk_rating'

export const TaxonSpeciesProjectRiskRatingModel = defineWithDefaults<TaxonSpeciesProjectRiskRating>(
  MODEL_TAXON_SPECIES_PROJECT_RISK_RATING,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    projectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // FKs
    riskRatingId: DataTypes.INTEGER, // 1

    // Facts
    sourceUrl: DataTypes.STRING(511),
    sourceName: DataTypes.STRING(255),
    riskRatingCustomCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  },
  {
    tableName: TABLE_TAXON_SPECIES_PROJECT_RISK_RATING
  }
)
