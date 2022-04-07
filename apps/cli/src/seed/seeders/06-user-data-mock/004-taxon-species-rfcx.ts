import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

// import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
// import { TaxonSpeciesRfcx } from '@rfcx-bio/common/dao/types'
// import { isDefined } from '@rfcx-bio/utils/predicates'

// import { taxonSpeciesRfcx } from '../_data/taxon-species-rfcx'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // const sequelize = params.context.sequelize
  // const models = ModelRepository.getInstance(sequelize)

  // // Key Lookups
  // const speciesScientificToId: Record<string, number> = await models.TaxonSpecies.findAll()
  //   .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

  // // Convert data
  // const data: TaxonSpeciesRfcx[] = Object.entries(taxonSpeciesRfcx)
  //   .map(([scientificName, data]) => {
  //     // Try to find species ID
  //     const taxonSpeciesId = speciesScientificToId[scientificName]
  //     if (!taxonSpeciesId) return undefined

  //     return {
  //       taxonSpeciesId,
  //       ...data
  //     }
  //   })
  //   .filter(isDefined)

  // await models.TaxonSpeciesRfcx.bulkCreate(data)
}
