import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type DashboardSpeciesThreatened } from '../types/dashboard-species-threatened'

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
    taxonClassSlug: DataTypes.STRING(255),
    taxonSpeciesSlug: DataTypes.STRING(255),
    riskRatingId: DataTypes.INTEGER,

    // Facts
    scientificName: DataTypes.STRING(255),
    commonName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    photoUrl: {
      type: DataTypes.STRING(511),
       allowNull: true
    }
  },
  {
    tableName: TABLE_DASHBOARD_SPECIES_THREATENED,
    timestamps: false
  }
)
