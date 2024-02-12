import { type Client } from '@opensearch-project/opensearch'
import { type Dayjs } from 'dayjs'
import { type Sequelize } from 'sequelize'

export const syncOrganizationsData = async (_client: Client, _sequelize: Sequelize, _latestSyncData: Dayjs): Promise<void> => {
  console.info('organizations search is currently unimplemented')
}
