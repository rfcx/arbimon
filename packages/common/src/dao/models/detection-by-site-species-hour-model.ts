import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { DetectionBySiteSpeciesHour } from '../types'

export const MODEL_DETECTION_BY_SITE_SPECIES_HOUR = 'DetectionBySiteSpeciesHour'
export const TABLE_DETECTION_BY_SITE_SPECIES_HOUR = 'detection_by_site_species_hour'
export const UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR: Array<keyof DetectionBySiteSpeciesHour> = ['locationProjectId', 'taxonClassId', 'count', 'countsByMinute']

export const DetectionBySiteSpeciesHourModel = defineWithDefaults<DetectionBySiteSpeciesHour>(
  MODEL_DETECTION_BY_SITE_SPECIES_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE,
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
    // Count of the minutes where detections are present
    count: DataTypes.INTEGER,
    // Array of `(index,count)` pairs where `count` is the number of recordings at minute `index`
    // Example: {{0,1},{5,2},{10,1}} => 1 recording in 0th minute, 2 recordings in the 5th minute, 1 recording in the 10th minute
    // `index` is between 0 and 59, `count` is a positive integer
    countsByMinute: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER))
  },
  {
    tableName: TABLE_DETECTION_BY_SITE_SPECIES_HOUR
  }
)
