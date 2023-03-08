import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { TaxonSpeciesIucnModel } from '@rfcx-bio/common/dao/models/taxon-species-iucn-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { type TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { rawTaxonSpeciesIucn } from '@/db/seeders/_data/taxon-species-iucn'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const speciesSlugToId: Record<string, number> = await TaxonSpeciesModel(sequelize)
    .findAll({ attributes: ['id', 'slug'] })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  // Convert data
  const data: TaxonSpeciesIucn[] = rawTaxonSpeciesIucn
    .map(({ taxonSpeciesId: _, 'TaxonSpecies.slug': slug, ...rest }) => {
      const taxonSpeciesId = speciesSlugToId[slug]
      if (!taxonSpeciesId) return undefined

      return {
        taxonSpeciesId,
        ...rest
      }
    })
    .filter(isDefined)

  await TaxonSpeciesIucnModel(sequelize).bulkCreate(data)
}
