import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterTaxonClasses } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

const testSpecies1: TaxonSpecies = {
  id: 1,
  idArbimon: 1,
  slug: 'catto',
  taxonClassId: masterTaxonClasses.Mammals.id, // 600
  scientificName: 'catto'
}

const testSpecies2: TaxonSpecies = {
  id: 2,
  idArbimon: 2,
  slug: 'cobra',
  taxonClassId: masterTaxonClasses.Amphibians.id, // 100
  scientificName: 'cobra'
}

const testSpecies3: TaxonSpecies = {
  id: 3,
  idArbimon: 3,
  slug: 'eagle',
  taxonClassId: masterTaxonClasses.Birds.id, // 300
  scientificName: 'eagle'
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked projects
  const taxonSpecies: TaxonSpecies[] = [testSpecies1, testSpecies2, testSpecies3]
  await ModelRepository.getInstance(getSequelize())
    .TaxonSpecies
    .bulkCreate(taxonSpecies)
}
