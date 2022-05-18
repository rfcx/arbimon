import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Source } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { testSource } from '@/seed/data/integration/source'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked source
  const source: Source[] = [testSource]
  await ModelRepository.getInstance(getSequelize())
    .Source
    .bulkCreate(source)
}
