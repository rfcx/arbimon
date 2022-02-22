import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../helpers/defaults'
import { DashboardSpeciesThreatened } from '../types/dashboard-species-threatened'

export const MODEL_DASHBOARD_SPECIES_THREATENED = 'DashboardSpeciesThreatened'
export const TABLE_DASHBOARD_SPECIES_THREATENED = 'dashboard_species_threatened'

export const DashboardSpeciesThreatenedModel = defineWithDefaults<DashboardSpeciesThreatened>(
  MODEL_DASHBOARD_SPECIES_THREATENED,
  {
    // PK
    locationProjectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Dimensions
    riskRatingIucnId: DataTypes.INTEGER,
    taxonClassSlug: DataTypes.STRING(255),
    taxonSpeciesSlug: DataTypes.STRING(255),

    // Facts
    scientificName: DataTypes.STRING(255),
    commonName: DataTypes.STRING(255),
    photoUrl: DataTypes.STRING(511)
  },
  {
    tableName: TABLE_DASHBOARD_SPECIES_THREATENED,
    timestamps: false
  }
)
