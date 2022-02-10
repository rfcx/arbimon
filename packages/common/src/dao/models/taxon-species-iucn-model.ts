import { DataTypes, INTEGER } from 'sequelize'

import { defineWithDefaults } from '@/dao/helpers/defaults'
import { TABLE_TAXON_SPECIES_IUCN } from '@/dao/table-names'
import { TaxonSpeciesIucn } from '@/dao/types/taxon-species-iucn'

export const TaxonSpeciesIucnModel = defineWithDefaults<TaxonSpeciesIucn>(
  'TaxonSpeciesIucn',
  {
    // PK
    taxonSpeciesId: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // Facts
    commonName: DataTypes.STRING(255), // Puerto Rican sharp-shinned hawk
    riskRatingIucnId: INTEGER, // 700 (= CR)
    description: DataTypes.TEXT, // ???
    descriptionSourceUrl: DataTypes.STRING(255) // ???
  },
  {
    tableName: TABLE_TAXON_SPECIES_IUCN
  }
)
