import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterTaxonClasses } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

const testSpecies: TaxonSpecies[] = [
  {
    id: 1,
    idArbimon: 1,
    slug: 'cat',
    taxonClassId: masterTaxonClasses.Mammals.id, // 600
    scientificName: 'Felis catus'
  },
  {
    id: 2,
    idArbimon: 2,
    slug: 'cobra',
    taxonClassId: masterTaxonClasses.Amphibians.id, // 100
    scientificName: 'Naja'
  },
  {
    id: 3,
    idArbimon: 3,
    slug: 'eagle',
    taxonClassId: masterTaxonClasses.Birds.id, // 300
    scientificName: 'Accipitridae'
  },
  {
    id: 4,
    idArbimon: 4,
    slug: 'sparrow',
    taxonClassId: masterTaxonClasses.Birds.id, // 300
    scientificName: 'Passeridae'
  },
  {
    id: 5,
    idArbimon: 5,
    slug: 'dog',
    taxonClassId: masterTaxonClasses.Mammals.id, // 600
    scientificName: 'Canis lupus familiaris'
  },
  {
    id: 6,
    idArbimon: 6,
    slug: 'watermonitor',
    taxonClassId: masterTaxonClasses.Amphibians.id, // 100
    scientificName: 'Varanus salvator'
  },
  {
    id: 7,
    idArbimon: 7,
    slug: 'cricket',
    taxonClassId: masterTaxonClasses.Insects.id, // 500
    scientificName: 'Grylloidea'
  },
  {
    id: 8,
    idArbimon: 8,
    slug: 'rooster',
    taxonClassId: masterTaxonClasses.Birds.id, // 300
    scientificName: 'Gallus gallus'
  },
  {
    id: 9,
    idArbimon: 9,
    slug: 'poison-dart-frog',
    taxonClassId: masterTaxonClasses.Amphibians.id, // 100
    scientificName: 'Dendrobatidae'
  }
]

/**
 * Create mocked taxon species
 * @param params
 */
export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await ModelRepository.getInstance(getSequelize())
    .TaxonSpecies
    .bulkCreate(testSpecies)
}
