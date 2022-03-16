import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesRfcxModel } from '@rfcx-bio/common/dao/models/taxon-species-rfcx-model'
import { TaxonSpeciesRfcx } from '@rfcx-bio/common/dao/types'
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
        const taxonSpeciesId = speciesScientificToId[scientificName]
        return taxonSpeciesId
          ? { taxonSpeciesId, ...data }
          : undefined
      })
    .filter(isDefined)

  await TaxonSpeciesRfcxModel(sequelize).bulkCreate(data)
}
