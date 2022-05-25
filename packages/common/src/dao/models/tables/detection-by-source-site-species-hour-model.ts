import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { DetectionBySourceSiteSpeciesHour } from '../../types'

export const MODEL_DETECTION_BY_SOURCE_SITE_SPECIES_HOUR = 'DetectionBySourceSiteSpeciesHour'
const TABLE_DETECTION_BY_SOURCE_SITE_SPECIES_HOUR = 'detection_by_source_site_species_hour'

export const DetectionBySourceSiteSpeciesHourModel = defineWithDefaults<DetectionBySourceSiteSpeciesHour>(
  MODEL_DETECTION_BY_SOURCE_SITE_SPECIES_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE(3),
      primaryKey: true
    },
    sourceId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    projectSiteId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    taxonSpeciesId: { // 456
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // FKs
    projectId: DataTypes.INTEGER, // 123

    // Facts
    detectionMinutes: DataTypes.STRING(255) // DataTypes.ARRAY(DataTypes.INTEGER) // [2, 3, 7, 14]
  },
  {
    tableName: TABLE_DETECTION_BY_SOURCE_SITE_SPECIES_HOUR
  }
)
