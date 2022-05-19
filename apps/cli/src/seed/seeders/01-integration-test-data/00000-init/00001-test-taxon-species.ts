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
    slug: 'catto',
    taxonClassId: masterTaxonClasses.Mammals.id, // 600
    scientificName: 'catto'
  },
  {
    id: 2,
    idArbimon: 2,
    slug: 'cobra',
    taxonClassId: masterTaxonClasses.Amphibians.id, // 100
    scientificName: 'cobra'
  },
  {
    id: 3,
    idArbimon: 3,
    slug: 'eagle',
    taxonClassId: masterTaxonClasses.Birds.id, // 300
    scientificName: 'eagle'
  },
  {
    id: 4,
    idArbimon: 4,
    slug: 'sparrow',
    taxonClassId: masterTaxonClasses.Birds.id, // 300
    scientificName: 'sparrow'
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
