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
    taxonClassSlug: DataTypes.STRING(255),
    taxonSpeciesSlug: DataTypes.STRING(255),
    riskRatingIucnId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

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
    tableName: TABLE_DASHBOARD_SPECIES_HIGHLIGHTED,
    timestamps: false
  }
)
