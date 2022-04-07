import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { ProjectProfileHighlightedSpecies } from '../../types'

export const MODEL_PROJECT_PROFILE_HIGHLIGHTED_SPECIES = 'ProjectProfileHighlightedSpecies'
const TABLE_PROJECT_PROFILE_HIGHLIGHTED_SPECIES = 'project_profile_highlighted_species'

export const ProjectProfileHighlightedSpeciesModel = defineWithDefaults<ProjectProfileHighlightedSpecies>(
  MODEL_PROJECT_PROFILE_HIGHLIGHTED_SPECIES,
  {
    // PK
    projectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    highlightedOrder: DataTypes.INTEGER
  },
  {
    tableName: TABLE_PROJECT_PROFILE_HIGHLIGHTED_SPECIES
  }
)
