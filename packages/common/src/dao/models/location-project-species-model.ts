import { DataTypes } from 'sequelize'

import { ProjectSpecies } from '@/dao/types/location-project-species'
import { defineWithDefaults } from '../helpers/defaults'
import { TABLE_LOCATION_PROJECTS_SPECIES } from '../table-names'

export const ProjectSpeciesModel = defineWithDefaults<ProjectSpecies>(
  'LocationProjectSpecies',
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

    // Facts
    highlightedOrder: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    riskRatingLocalLevel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    riskRatingLocalCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    riskRatingLocalSource: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    tableName: TABLE_LOCATION_PROJECTS_SPECIES
  }
)
