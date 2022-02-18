import { DataTypes } from 'sequelize'

import { DashboardRichnessByTaxon } from '@/dao/types/dashboard-richness-by-taxon'
import { defineWithDefaults } from '../helpers/defaults'

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
    commonName: {
      type: DataTypes.STRING(255),
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
