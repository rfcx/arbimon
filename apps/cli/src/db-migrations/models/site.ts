import { DataTypes } from 'sequelize'

import { Site } from '@rfcx-bio/common/api-bio/common/sites'
import { TABLE_SITES } from '@rfcx-bio/common/dao'

import { getSequelize } from '../connections'
import { defineWithDefaults } from '../helpers'

const sequelize = getSequelize()

export const SiteDao = defineWithDefaults<Site>(
  sequelize,
  'Site',
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // External
    idCore: { type: DataTypes.STRING(12) }, // MoLQA8aNulGb
    idArbimon: { type: DataTypes.INTEGER }, // 8412
    // Dimensions
    locationProjectId: { type: DataTypes.INTEGER }, // 1
    // Facts
    name: { type: DataTypes.STRING(255) }, // 'CU26'
    latitude: { type: DataTypes.FLOAT }, // 18.31307
    longitude: { type: DataTypes.FLOAT }, // -65.24878
    altitude: { type: DataTypes.FLOAT } // 30.85246588
  },
  {
    tableName: TABLE_SITES
  }
)
