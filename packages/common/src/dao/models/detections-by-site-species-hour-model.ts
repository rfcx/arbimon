import { DataTypes } from 'sequelize'

import { DetectionsBySiteSpeciesHour } from '../../domain'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_DETECTIONS_BY_SITE_SPECIES_HOUR } from '../table-names'

export const DetectionsBySiteSpeciesHourModel = defineWithDefaults<DetectionsBySiteSpeciesHour>(
  'DetectionsBySiteSpeciesHour',
  {
    // PK
    timeHourLocal: DataTypes.DATE(3), // '2021-03-18T11:00:00.000Z' (as date)
    locationSiteId: DataTypes.INTEGER, // 123
    taxonSpeciesId: DataTypes.INTEGER, // 456

    // Facts
    count: DataTypes.INTEGER, // 1
    durationMinutes: DataTypes.INTEGER // 12
  },
  {
    tableName: TABLE_DETECTIONS_BY_SITE_SPECIES_HOUR
  }
)
