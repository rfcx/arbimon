import { type Client } from '@opensearch-project/opensearch'
import { type Sequelize } from 'sequelize'

import { recreateIndexes } from '../../search/recreate-index'

export const indexOpensearch = async (opensearch: Client, sequelize: Sequelize): Promise<void> => {
  console.info('Full (re)index of opensearch:')
  await recreateIndexes(opensearch, sequelize)
  console.info('Successfully (re)indexed opensearch')
}
