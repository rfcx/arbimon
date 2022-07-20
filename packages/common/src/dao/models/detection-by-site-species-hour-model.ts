import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { DetectionBySiteSpeciesHour } from '../types'

export const MODEL_DETECTION_BY_SITE_SPECIES_HOUR = 'DetectionBySiteSpeciesHour'
export const TABLE_DETECTION_BY_SITE_SPECIES_HOUR = 'detection_by_site_species_hour'
export const UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR: Array<keyof DetectionBySiteSpeciesHour> = ['locationProjectId', 'taxonClassId', 'count', 'durationMinutes', 'detectionMinutes']

export const DetectionBySiteSpeciesHourModel = defineWithDefaults<DetectionBySiteSpeciesHour>(
  MODEL_DETECTION_BY_SITE_SPECIES_HOUR,
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
    durationMinutes: DataTypes.INTEGER,
    detectionMinutes: {
      type: DataTypes.STRING(255),
      defaultValue: null
    }
  },
  {
    tableName: TABLE_DETECTION_BY_SITE_SPECIES_HOUR
  }
)
