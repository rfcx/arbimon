import { Sequelize } from 'sequelize'

import { ATTRIBUTES_TAXON_SPECIES, TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TAXONOMY_CLASSES } from '@rfcx-bio/common/mock-data/raw-taxon-classes'

import { ArbimonSpeciesData } from '../input-from-mock-detections'

export const writeArbimonSpeciesDataToPostgres = async (sequelize: Sequelize, species: ArbimonSpeciesData[]): Promise<void> => {
  const model = TaxonSpeciesModel(sequelize)

  // get class id
  const taxonClassArbimonToBio = Object.fromEntries(
    TAXONOMY_CLASSES.map(t => [t.idArbimon, t.id])
  )

  const newData = species.map(s => ({
    idArbimon: s.speciesId,
    slug: s.speciesSlug,
    taxonClassId: taxonClassArbimonToBio[s.taxonId],
    scientificName: s.scientificName
  }))

  await model.bulkCreate(newData, {
    updateOnDuplicate: ATTRIBUTES_TAXON_SPECIES.light
  }).then(async () => {
    // fix auto increment key break - https://github.com/sequelize/sequelize/issues/9295
    await sequelize.query('select setval(\'taxon_species_id_seq\', (select max(id) from taxon_species), true);')
  })
}
