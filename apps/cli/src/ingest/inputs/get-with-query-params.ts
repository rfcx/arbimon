import { type Sequelize, QueryTypes } from 'sequelize'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type SyncQueryParams } from './sync-query-params'

export const getWithQueryParams = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams, sql: string): Promise<unknown[]> => {
  // Do not process query if the date is not valid
  if (!dayjs(syncUntilDate).isValid()) return []

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'sqlite' ? syncUntilDate.toISOString() : String(syncUntilDate),
      syncUntilId: String(syncUntilId),
      syncBatchLimit: String(syncBatchLimit)
    }
  })
}
