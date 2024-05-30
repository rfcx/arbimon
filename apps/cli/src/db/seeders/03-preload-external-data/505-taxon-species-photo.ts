import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/node-common/dao/models/taxon-species-model'
import { TaxonSpeciesPhotoModel } from '@rfcx-bio/node-common/dao/models/taxon-species-photo-model'
import { type TaxonSpeciesPhoto } from '@rfcx-bio/node-common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { rawTaxonSpeciesPhoto } from '@/db/seeders/_data/taxon-species-photo'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const speciesSlugToId: Record<string, number> = await TaxonSpeciesModel(sequelize)
    .findAll({ attributes: ['id', 'slug'] })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  // Convert data
  const data: TaxonSpeciesPhoto[] = rawTaxonSpeciesPhoto
    .map(({ taxonSpeciesId: _, 'TaxonSpecies.slug': slug, ...rest }) => {
      const taxonSpeciesId = speciesSlugToId[slug]
      if (!taxonSpeciesId) return undefined

      return {
        taxonSpeciesId,
        ...rest
      }
    })
    .filter(isDefined)

  await TaxonSpeciesPhotoModel(sequelize).bulkCreate(data)
}
