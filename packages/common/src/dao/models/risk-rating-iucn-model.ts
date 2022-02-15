import { DataTypes } from 'sequelize'

import { RiskRatingIucn } from '../../dao/types/risk-rating-iucn'
import { defineWithDefaults } from '../helpers/defaults'

export const MODEL_RISK_RATING_IUCN = 'RiskRatingIucn'
export const TABLE_RISK_RATING_IUCN = 'risk_rating_iucn'

export const RiskRatingIucnModel = defineWithDefaults<RiskRatingIucn>(
  MODEL_RISK_RATING_IUCN,
  {
    // PK
    idOrdered: { // 1
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
    tableName: TABLE_RISK_RATING_IUCN
  }
)
