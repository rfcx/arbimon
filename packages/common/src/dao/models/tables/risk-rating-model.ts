import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { RiskRating } from '../../types'

export const MODEL_RISK_RATING = 'RiskRating'
const TABLE_RISK_RATING = 'risk_rating'

export const RiskRatingModel = defineWithDefaults<RiskRating>(
  MODEL_RISK_RATING,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
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
