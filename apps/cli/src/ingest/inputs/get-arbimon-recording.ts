import { QueryTypes, Sequelize } from 'sequelize'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { SyncQueryParams } from './sync-query-params'

export interface ArbimonRecordingQuery {
  siteIdArbimon: number
  datetime: Date
  duration: number
  idArbimon: number
  updatedAt: Date
}

export const getArbimonRecording = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  // Do not process query if the date is not valid
  if (!dayjs(syncUntilDate).isValid()) return []

  const sql = `SELECT r.site_id siteIdArbimon,
      r.datetime datetime,
      r.duration duration,
      r.recording_id idArbimon,
      r.upload_time updatedAt
    FROM recordings r
    WHERE r.upload_time > $syncUntilDate OR (r.upload_time = $syncUntilDate AND r.recording_id > $syncUntilId)
      AND r.datetime is not null
      AND r.upload_time is not null
    ORDER BY r.upload_time, r.recording_id
    LIMIT $syncBatchLimit
    ;
  `

  const isMySql = sequelize.getDialect() === 'mysql'

  const results = await sequelize.query<ArbimonRecordingQuery>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: isMySql ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit
    }
  })

  return results.map(row => ({
    ...row,
    datetime: isMySql ? row.datetime.toISOString() : row.datetime,
    updatedAt: isMySql ? row.updatedAt.toISOString() : row.updatedAt
  }))
}
