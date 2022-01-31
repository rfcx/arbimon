import { DataTypes, ModelCtor, Sequelize } from 'sequelize'

import { Site } from '@rfcx-bio/common/api-bio/common/sites'
import { TABLE_SITES } from '@rfcx-bio/common/dao'

import { defineWithDefaults, ModelForInterfacePk } from '../helpers'

export const SiteDao = (sequelize: Sequelize): ModelCtor<ModelForInterfacePk<Site>> => defineWithDefaults<Site>(
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
    idCore: DataTypes.STRING(12), // MoLQA8aNulGb
    idArbimon: DataTypes.INTEGER, // 8412
    // Dimensions
    locationProjectId: DataTypes.INTEGER, // 1
    // Facts
    name: DataTypes.STRING(255), // 'CU26'
    latitude: DataTypes.FLOAT, // 18.31307
    longitude: DataTypes.FLOAT, // -65.24878
    altitude: DataTypes.FLOAT // 30.85246588
  },
  {
    tableName: TABLE_SITES
  }
)
