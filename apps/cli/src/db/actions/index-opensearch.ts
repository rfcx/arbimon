import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

import { syncAllProjects } from '@/search/all'

export const indexOpensearch = async (opensearch: Client, sequelize: Sequelize): Promise<void> => {
  console.info('Full (re)index of opensearch:')
  await syncAllProjects(opensearch, sequelize)
  console.info('Successfully (re)indexed opensearch')
}
