import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const models = ModelRepository.getInstance(params.context.sequelize)

  // Lookups
  const taxonClassArbimonToBio = await models
    .TaxonClass
    .findAll()
    .then(res => Object.fromEntries(res.map(t => [t.idArbimon, t.id])))

  // Save
  // TODO: Delete rawSpecies & replace with a seed datasource
  const data: Array<Optional<TaxonSpecies, 'id'>> =
    rawSpecies.map(s => ({
      idArbimon: s.speciesId,
      slug: s.speciesSlug,
      taxonClassId: taxonClassArbimonToBio[s.taxonId],
      scientificName: s.scientificName
    }))

  await models
    .TaxonSpecies
    .bulkCreate(data)
    .then(async () => {
      // fix auto increment key break - https://github.com/sequelize/sequelize/issues/9295
      await params.context.sequelize.query('select setval(\'taxon_species_id_seq\', (select max(id) from taxon_species), true);')
    })
}
