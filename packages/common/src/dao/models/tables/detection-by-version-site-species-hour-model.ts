import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { DetectionByVersionSiteSpeciesHour } from '../../types'

export const MODEL_DETECTION_BY_VERSION_SITE_SPECIES_HOUR = 'DetectionByVersionSiteSpeciesHour'
const TABLE_DETECTION_BY_VERSION_SITE_SPECIES_HOUR = 'detection_by_version_site_species_hour'
export const UPDATE_ON_DUPLICATE_DETECTION_BY_VERSION_SITE_SPECIES_HOUR: Array<keyof DetectionByVersionSiteSpeciesHour> = ['taxonClassId', 'countDetectionMinutes']

export const DetectionByVersionSiteSpeciesHourModel = defineWithDefaults<DetectionByVersionSiteSpeciesHour>(
  MODEL_DETECTION_BY_VERSION_SITE_SPECIES_HOUR,
  {
    // PK
    timePrecisionHourLocal: { // '2021-03-18T11:00:00.000Z' (as date)
      type: DataTypes.DATE(3),
      primaryKey: true
    },
    projectVersionId: { // 123
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
    taxonClassId: DataTypes.INTEGER,

    // Facts
    countDetectionMinutes: DataTypes.INTEGER // 1
  },
  {
    tableName: TABLE_DETECTION_BY_VERSION_SITE_SPECIES_HOUR
  }
)
