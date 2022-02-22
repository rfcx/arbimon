import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../helpers/defaults'
import { DetectionBySiteSpeciesHour } from '../types'

export const MODEL_DETECTIONS_BY_SITE_SPECIES_HOUR = <const>'DetectionsBySiteSpeciesHour'
export const TABLE_DETECTIONS_BY_SITE_SPECIES_HOUR = <const>'detection_by_site_species_hour'

export const DetectionsBySiteSpeciesHourModel = defineWithDefaults<DetectionBySiteSpeciesHour>(
  MODEL_DETECTIONS_BY_SITE_SPECIES_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
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
