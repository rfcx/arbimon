import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

import { fullReindex } from '@/search/full-reindex'

export const indexOpensearch = async (opensearch: Client, sequelize: Sequelize): Promise<void> => {
  console.info('Full (re)index of opensearch:')
  await fullReindex(opensearch, sequelize)
  console.info('Successfully (re)indexed opensearch')
}
