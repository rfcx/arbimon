import { QueryTypes, Sequelize } from 'sequelize'

import { SyncQueryParams } from './sync-query-params'

export interface ArbimonRecordingQuery {
  projectIdArbimon: number
  siteIdArbimon: number
  datetime: Date
  duration: number
  idArbimon: number
  updatedAt: Date
}

export const getArbimonRecordingBySiteHour = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  const sql = `SELECT  s.project_id projectIdArbimon,
      r.site_id siteIdArbimon,
      r.datetime datetime,
      r.duration duration,
      r.recording_id idArbimon,
      r.upload_time updatedAt
    FROM recordings r
    JOIN sites s ON r.site_id = s.site_id
    WHERE r.upload_time > $syncUntilDate OR (r.upload_time = $syncUntilDate AND r.recording_id > $syncUntilId)
    ORDER BY r.upload_time, r.recording_id
    LIMIT $syncBatchLimit;
  `

  const results = await sequelize.query<ArbimonRecordingQuery>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit
    }
  })

  return results.map(row => ({
    ...row,
    datetime: sequelize.getDialect() === 'mysql' ? row.datetime.toISOString() : row.datetime,
    updatedAt: sequelize.getDialect() === 'mysql' ? row.updatedAt.toISOString() : row.updatedAt
  }))
}
