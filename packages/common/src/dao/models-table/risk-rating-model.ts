import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-helpers/defaults'
import { RiskRatingIucn } from '../types/risk-rating-iucn'

export const MODEL_RISK_RATING = 'RiskRating'
export const TABLE_RISK_RATING = 'risk_rating'

export const RiskRatingModel = defineWithDefaults<RiskRatingIucn>(
  MODEL_RISK_RATING,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    code: { // CR
      type: DataTypes.STRING(2),
      unique: true
    },

    // Facts
    isThreatened: DataTypes.BOOLEAN // true
  },
  {
    tableName: TABLE_RISK_RATING
  }
)
