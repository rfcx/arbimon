import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { SourceDetectionBySyncSiteSpeciesHour } from '../../types'

export const MODEL_SOURCE_DETECTION_BY_SYNC_SITE_SPECIES_HOUR = 'SourceDetectionBySyncSiteSpeciesHour'
const TABLE_SOURCE_DETECTION_BY_SYNC_SITE_SPECIES_HOUR = 'source_detection_by_sync_site_species_hour'

export const SourceDetectionBySyncSiteSpeciesHourModel = defineWithDefaults<SourceDetectionBySyncSiteSpeciesHour>(
  MODEL_SOURCE_DETECTION_BY_SYNC_SITE_SPECIES_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE(3),
      primaryKey: true
    },
    sourceSyncId: { // 123
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

    // Facts
    detectionMinutes: DataTypes.ARRAY(DataTypes.INTEGER) // [2, 3, 7, 14]
  },
  {
    tableName: TABLE_SOURCE_DETECTION_BY_SYNC_SITE_SPECIES_HOUR
  }
)
