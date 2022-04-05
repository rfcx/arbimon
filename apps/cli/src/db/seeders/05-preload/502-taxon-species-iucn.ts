import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

// import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
// import { TaxonSpeciesRiskRating } from '@rfcx-bio/common/dao/types'
// import { isDefined } from '@rfcx-bio/utils/predicates'

// import { rawTaxonSpeciesIucn } from '@/db/seeders/_data/taxon-species-iucn'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // const sequelize = params.context.sequelize
  // const models = ModelRepository.getInstance(sequelize)

  // // Lookups
  // const speciesSlugToId: Record<string, number> = await models.TaxonSpecies
  //   .findAll({ attributes: ['id', 'slug'] })
  //   .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  // // Convert data
  // const data: TaxonSpeciesRiskRating[] = rawTaxonSpeciesIucn
  //   .map(({ taxonSpeciesId: _, 'TaxonSpecies.slug': slug, ...rest }) => {
  //     const taxonSpeciesId = speciesSlugToId[slug]
  //     if (!taxonSpeciesId) return undefined

  //     return {
  //       taxonSpeciesId,
  //       ...rest
  //     }
  //   })
  //   .filter(isDefined)

  // await models.TaxonSpeciesIucn.bulkCreate(data)
}
