import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../model-factory-helpers/defaults'
import { TaxonSpeciesWiki } from '../types/taxon-species-wiki'

export const MODEL_TAXON_SPECIES_WIKI = 'TaxonSpeciesWiki'
export const TABLE_TAXON_SPECIES_WIKI = 'taxon_species_wiki'
export const UPDATE_ON_DUPLICATE_TAXON_SPECIES_WIKI: Array<keyof TaxonSpeciesWiki> = ['description', 'descriptionSourceUrl']

export const TaxonSpeciesWikiModel = defineWithDefaults<TaxonSpeciesWiki>(
  MODEL_TAXON_SPECIES_WIKI,
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    description: DataTypes.TEXT, // ???
    descriptionSourceUrl: DataTypes.STRING(255) // ???
  },
  {
    tableName: TABLE_TAXON_SPECIES_WIKI
  }
)
