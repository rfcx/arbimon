import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../helpers/defaults'
import { DashboardSpeciesHighlighted } from '../types/dashboard-species-highlighted'

export const MODEL_DASHBOARD_SPECIES_HIGHLIGHTED = 'DashboardSpeciesHighlighted'
export const TABLE_DASHBOARD_SPECIES_HIGHLIGHTED = 'dashboard_species_highlighted'

export const DashboardSpeciesHighlightedModel = defineWithDefaults<DashboardSpeciesHighlighted>(
  MODEL_DASHBOARD_SPECIES_HIGHLIGHTED,
  {
    // PK
    locationProjectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    highlightedOrder: {
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
    tableName: TABLE_DASHBOARD_SPECIES_HIGHLIGHTED,
    timestamps: false
  }
)
