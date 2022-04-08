import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

// import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
// import { TaxonSpeciesWiki } from '@rfcx-bio/common/dao/types'
// import { isDefined } from '@rfcx-bio/utils/predicates'

// import { rawTaxonSpeciesWiki } from '@/db/seeders/_data/taxon-species-wiki'

// import { QueryInterface } from 'sequelize'
// import { MigrationFn } from 'umzug'

// import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
// import { TaxonSpeciesPhoto } from '@rfcx-bio/common/dao/types'
// import { isDefined } from '@rfcx-bio/utils/predicates'

// import { rawTaxonSpeciesPhoto } from '../../data/generated/taxon-species-photo'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // FROM WIKI

  // const sequelize = params.context.sequelize
  // const models = ModelRepository.getInstance(sequelize)

  // // Lookups
  // const speciesSlugToId: Record<string, number> = await models.TaxonSpecies
  //   .findAll({ attributes: ['id', 'slug'] })
  //   .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  // // Convert data
  // const data: TaxonSpeciesWiki[] = rawTaxonSpeciesWiki
  //   .map(({ taxonSpeciesId: _, 'TaxonSpecies.slug': slug, ...rest }) => {
  //     const taxonSpeciesId = speciesSlugToId[slug]
  //     if (!taxonSpeciesId) return undefined

  //     return {
  //       taxonSpeciesId,
  //       ...rest
  //     }
  //   })
  //   .filter(isDefined)

  // await models.TaxonSpeciesWiki.bulkCreate(data)

  // FROM PHOTO

  // const sequelize = params.context.sequelize
  // const models = ModelRepository.getInstance(sequelize)

  // // Lookups
  // const speciesSlugToId: Record<string, number> = await models.TaxonSpecies
  //   .findAll({ attributes: ['id', 'slug'] })
  //   .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  // // Convert data
  // const data: TaxonSpeciesPhoto[] = rawTaxonSpeciesPhoto
  //   .map(({ taxonSpeciesId: _, 'TaxonSpecies.slug': slug, ...rest }) => {
  //     const taxonSpeciesId = speciesSlugToId[slug]
  //     if (!taxonSpeciesId) return undefined

  //     return {
  //       taxonSpeciesId,
  //       ...rest
  //     }
  //   })
  //   .filter(isDefined)

  // await models.TaxonSpeciesPhoto.bulkCreate(data)
}
