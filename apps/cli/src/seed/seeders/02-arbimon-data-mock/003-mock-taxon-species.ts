import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { taxonSpeciesArbimon } from '../../data/generated/taxon-species-arbimon'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Lookups
  const taxonClassSlugToId = await models.TaxonClass.findAll()
    .then(res => Object.fromEntries(res.map(t => [t.slug, t.id])))

  // Create species
  const taxonSpecies: Array<Optional<TaxonSpecies, 'id'>> = taxonSpeciesArbimon
    .map(({ taxonSlug, ...rest }) => {
      const taxonClassId = taxonClassSlugToId[taxonSlug]
      if (!taxonClassId) throw new Error('Missing taxon class')

      return { ...rest, taxonClassId }
    })

  await models.TaxonSpecies.bulkCreate(taxonSpecies)
}
