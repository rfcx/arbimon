import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { type DashboardRichnessByTaxon } from '../types/dashboard-richness-by-taxon'

export const MODEL_DASHBOARD_RICHNESS_BY_TAXON = 'DashboardRichnessByTaxon'
export const TABLE_DASHBOARD_RICHNESS_BY_TAXON = 'dashboard_richness_by_taxon'

export const DashboardRichnessByTaxonModel = defineWithDefaults<DashboardRichnessByTaxon>(
  MODEL_DASHBOARD_RICHNESS_BY_TAXON,
  {
    // PK
    locationProjectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    taxonClassId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    count: DataTypes.INTEGER // 56
  },
  {
    tableName: TABLE_DASHBOARD_RICHNESS_BY_TAXON,
    timestamps: false
  }
)
