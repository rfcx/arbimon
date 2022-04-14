import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { rawSpecies } from '../../data/manual/taxon-species'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  // Lookups
  const taxonClassArbimonToBio = await models.TaxonClass.findAll()
    .then(res => Object.fromEntries(res.map(t => [t.idArbimon, t.id])))

  // Create species
  const taxonSpecies: Array<Optional<TaxonSpecies, 'id'>> = rawSpecies.map(s => {
    const taxonClassId = taxonClassArbimonToBio[s.taxonId]
    if (!taxonClassId) throw new Error('Missing taxon class')

    return {
      idArbimon: s.speciesId,
      slug: s.speciesSlug,
      scientificName: s.scientificName,
      taxonClassId
    }
  })

  await models.TaxonSpecies.bulkCreate(taxonSpecies)
}
