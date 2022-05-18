import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Source } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

export const testSource: Source = {
  id: 10001,
  name: 'source-test-project-10001'
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Create mocked source
  const source: Source[] = [testSource]
  await ModelRepository.getInstance(getSequelize())
    .Source
    .bulkCreate(source)
}
