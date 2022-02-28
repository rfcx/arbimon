import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'
import { rawSpecies, TAXONOMY_CLASSES } from '@rfcx-bio/common/mock-data'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const model = TaxonSpeciesModel(params.context.sequelize)

  const taxonClassArbimonToBio = Object.fromEntries(
    TAXONOMY_CLASSES.map(t => [t.idArbimon, t.id])
  )

  // TODO: Fix source data
  const data: Array<Optional<TaxonSpecies, 'id'>> =
    rawSpecies.map(s => ({
      idArbimon: s.speciesId,
      slug: s.speciesSlug,
      taxonClassId: taxonClassArbimonToBio[s.taxonId],
      scientificName: s.scientificName
    }))

  await model.bulkCreate(data).then(async () => {
    // fix auto increment key break - https://github.com/sequelize/sequelize/issues/9295
    await params.context.sequelize.query('select setval(\'taxon_species_id_seq\', (select max(id) from taxon_species), true);')
  })
}
