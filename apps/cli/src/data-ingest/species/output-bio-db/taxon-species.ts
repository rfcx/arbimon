import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_TAXON_SPECIES } from '@rfcx-bio/common/dao/types'

import { ArbimonSpeciesData } from '@/data-ingest/species/input-arbimon'

export const writeArbimonSpeciesDataToPostgres = async (sequelize: Sequelize, species: Array<Omit<ArbimonSpeciesData, 'taxon'>>): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Lookups
  const taxonClassArbimonToBio = await models
    .TaxonClass
    .findAll()
    .then(res => Object.fromEntries(res.map(t => [t.idArbimon, t.id])))

  // Save data
  const newData = species.map(s => ({
    idArbimon: s.idArbimon,
    slug: s.slug,
    taxonClassId: taxonClassArbimonToBio[s.taxonClassId],
    scientificName: s.scientificName
  }))

  await models
    .TaxonSpecies
    .bulkCreate(newData, {
      updateOnDuplicate: ATTRIBUTES_TAXON_SPECIES.updateOnDuplicate
    })
    .then(async () => {
      // fix auto increment key break - https://github.com/sequelize/sequelize/issues/9295
      await sequelize.query('select setval(\'taxon_species_id_seq\', (select max(id) from taxon_species), true);')
    })
}
