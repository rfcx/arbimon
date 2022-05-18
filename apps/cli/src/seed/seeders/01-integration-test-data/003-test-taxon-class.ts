import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonClass } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { testTaxonClass1, testTaxonClass2 } from '@/seed/data/integration/taxon-class'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create list of mocked taxon classes
  const taxonClasses: TaxonClass[] = [testTaxonClass1, testTaxonClass2]
  await ModelRepository.getInstance(getSequelize())
    .TaxonClass
    .bulkCreate(taxonClasses)
}
