import { ModelFactory } from 'dao/helpers/types'
import { DataTypes } from 'sequelize'

import { Site } from '../../domain'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_LOCATION_SITES } from '../table-names'

export const SiteModel: ModelFactory<Site> = sequelize => defineWithDefaults(
  sequelize,
  'LocationSite',
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
    tableName: TABLE_LOCATION_SITES
  }
)
