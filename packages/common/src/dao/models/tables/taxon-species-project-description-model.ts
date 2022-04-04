import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesProjectDescription } from '../../types'

export const MODEL_TAXON_SPECIES_PROJECT_DESCRIPTION = 'TaxonSpeciesProjectDescription'
const TABLE_TAXON_SPECIES_PROJECT_DESCRIPTION = 'taxon_species_project_description'

export const TaxonSpeciesProjectDescriptionModel = defineWithDefaults<TaxonSpeciesProjectDescription>(
  MODEL_TAXON_SPECIES_PROJECT_DESCRIPTION,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    projectId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    description: DataTypes.STRING(255)
  },
  {
    tableName: TABLE_TAXON_SPECIES_PROJECT_DESCRIPTION
  }
)
