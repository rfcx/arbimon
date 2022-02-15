import { DataTypes } from 'sequelize'

import { RiskRatingIucn } from '../../dao/types/risk-rating-iucn'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_RISK_RATING_IUCN } from '../table-names'

export const RiskRatingIucnModel = defineWithDefaults<RiskRatingIucn>(
  'RiskRatingIucn',
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
