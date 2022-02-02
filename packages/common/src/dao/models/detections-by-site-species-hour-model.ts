import { DataTypes } from 'sequelize'

import { DetectionsBySiteSpeciesHour } from '../../domain'
import { defineWithDefaultsAutoPk } from '../helpers/defaults'
import { TABLE_DETECTIONS_BY_SITE_SPECIES_HOUR } from '../table-names'

export const DetectionsBySiteSpeciesHourModel = defineWithDefaultsAutoPk<DetectionsBySiteSpeciesHour>(
  'DetectionsBySiteSpeciesHour',
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Dimensions
    locationSiteId: DataTypes.INTEGER, // 123
    taxonSpeciesId: DataTypes.INTEGER, // 456
    timeHourLocal: DataTypes.DATE, // '2021-03-18T11:00:00.000Z' (as date)

    // Facts
    count: DataTypes.INTEGER, // 1
    durationMinutes: DataTypes.INTEGER // 12
  },
  {
    tableName: TABLE_DETECTIONS_BY_SITE_SPECIES_HOUR
  }
)
