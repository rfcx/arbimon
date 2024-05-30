import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/node-common/dao/models/taxon-species-model'
import { TaxonSpeciesRfcxModel } from '@rfcx-bio/node-common/dao/models/taxon-species-rfcx-model'
import { type TaxonSpeciesRfcx } from '@rfcx-bio/node-common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { taxonSpeciesRfcx } from '../_data/taxon-species-rfcx'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Key Lookups
  const speciesScientificToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

  // Convert data
  const data: TaxonSpeciesRfcx[] = Object.entries(taxonSpeciesRfcx)
    .map(([scientificName, data]) => {
      // Try to find species ID
      const taxonSpeciesId = speciesScientificToId[scientificName]
      if (!taxonSpeciesId) return undefined

      return {
        taxonSpeciesId,
        ...data
      }
    })
    .filter(isDefined)

  await TaxonSpeciesRfcxModel(sequelize).bulkCreate(data)
}
