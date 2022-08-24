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

export const getArbimonRecording = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  const sql = `
    SELECT  s.project_id projectIdArbimon,
      r.site_id siteIdArbimon,
      r.datetime datetime,
      r.duration duration,
      r.recording_id idArbimon,
      r.upload_time updatedAt
    FROM recordings r
    JOIN sites s ON r.site_id = s.site_id
    JOIN projects p ON s.project_id = p.project_id
    WHERE (r.upload_time > $syncUntilDate OR (r.upload_time = $syncUntilDate AND r.recording_id > $syncUntilId))
      AND p.reports_enabled = 1
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
