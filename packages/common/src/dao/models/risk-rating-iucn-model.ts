import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { RiskRatingIucn } from '../types/risk-rating-iucn'

export const MODEL_RISK_RATING_IUCN = 'RiskRatingIucn'
export const TABLE_RISK_RATING_IUCN = 'risk_rating_iucn'
export const UPDATE_ON_DUPLICATE_RISK_RATING_IUCN: Array<(keyof RiskRatingIucn)> = ['code', 'isThreatened']

export const RiskRatingIucnModel = defineWithDefaults<RiskRatingIucn>(
  MODEL_RISK_RATING_IUCN,
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
    tableName: TABLE_RISK_RATING_IUCN
  }
)
