import { expect, test } from 'vitest'

import { getSequelize } from '@/db/connections'
import { fullReindex } from './full-reindex'
import { getOpenSearchClient } from './opensearch'

test('connect and create indexes ', async () => {
  const openSearchClient = getOpenSearchClient()
  const sequelize = getSequelize()

  await fullReindex(openSearchClient, sequelize)

  const indices = await openSearchClient.cat.indices({ format: 'json' }).then(response => (response.body as Array<{ index: string }>).map(i => i.index))
  expect(indices).toContain('projects')
})
