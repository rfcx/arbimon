import { DataTypes, INTEGER } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesRiskRating } from '../../types'

export const MODEL_TAXON_SPECIES_RISK_RATING = 'TaxonSpeciesRiskRating'
const TABLE_TAXON_SPECIES_RISK_RATING = 'taxon_species_risk_rating'

export const TaxonSpeciesRiskRatingModel = defineWithDefaults<TaxonSpeciesRiskRating>(
  MODEL_TAXON_SPECIES_RISK_RATING,
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

    // FKs
    riskRatingId: INTEGER, // 600 (= CR)

    // Facts
    sourceUrl: DataTypes.STRING(511),
    riskRatingCustomCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  },
  {
    tableName: TABLE_TAXON_SPECIES_RISK_RATING
  }
)
