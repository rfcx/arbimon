import { DataTypes } from 'sequelize'

import { DetectionsBySiteSpeciesHour } from '../../dao/types'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_DETECTIONS_BY_SITE_SPECIES_HOUR } from '../table-names'

export const DetectionsBySiteSpeciesHourModel = defineWithDefaults<DetectionsBySiteSpeciesHour>(
  'DetectionsBySiteSpeciesHour',
  {
    // PK
    timeHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE(3),
      primaryKey: true
    },
    locationSiteId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    taxonSpeciesId: { // 456
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Dimensions
    locationProjectId: DataTypes.INTEGER,
    taxonClassId: DataTypes.INTEGER,

    // Facts
    count: DataTypes.INTEGER, // 1
    durationMinutes: DataTypes.INTEGER // 12
  },
  {
    tableName: TABLE_DETECTIONS_BY_SITE_SPECIES_HOUR
  }
)
