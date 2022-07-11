import { QueryTypes, Sequelize } from 'sequelize'

import { SyncQueryParams } from './sync-query-params'

export interface ArbimonRecordingBySiteHourQuery {
  projectIdArbimon: number
  siteIdArbimon: number
  timePrecisionHourLocal: Date
  totalDuration: number
  recordedMinutes: number[]
  firstRecordingIdArbimon: number
  lastRecordingIdArbimon: number
  lastUploaded: Date
}

export const getArbimonRecordingBySiteHour = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<ArbimonRecordingBySiteHourQuery[]> => {
  // TODO: Calculate `timePrecisionHourLocal`
  const mysqlSQL = `
    SELECT  s.project_id projectIdArbimon,
            r.site_id siteIdArbimon,
            DATE_FORMAT(r.datetime, '%Y-%m-%d %H:00:00') timePrecisionHourLocal,
            SUM(r.duration) / 60 totalDuration,
            GROUP_CONCAT(DISTINCT MINUTE(r.datetime) SEPARATOR ',') recordedMinutes,
            MIN(r.recording_id) firstRecordingIdArbimon,
            MAX(r.recording_id) lastRecordingIdArbimon,
            MAX(r.upload_time) lastUploaded
    FROM recordings r 
    JOIN sites s ON r.site_id = s.site_id
    WHERE r.upload_time > $syncUntilDate OR (r.upload_time <= $syncUntilDate AND r.recording_id > $syncUntilId)
    GROUP BY projectIdArbimon, siteIdArbimon, timePrecisionHourLocal
    ORDER BY r.upload_time ASC
    LIMIT $syncBatchLimit
  `

  const sqliteSQL = `
    SELECT  s.project_id projectIdArbimon,
            r.site_id siteIdArbimon,
            strftime('%Y-%m-%d %H:00:00', r.datetime) timePrecisionHourLocal,
            SUM(r.duration) / 60 totalDuration,
            GROUP_CONCAT(DISTINCT strftime('%M', r.datetime)) recordedMinutes,
            MIN(r.recording_id) firstRecordingIdArbimon,
            MAX(r.recording_id) lastRecordingIdArbimon,
            MAX(r.upload_time) lastUploaded
    FROM recordings r
    JOIN sites s ON r.site_id = s.site_id
    WHERE r.upload_time > $syncUntilDate OR (r.upload_time <= $syncUntilDate AND r.recording_id > $syncUntilId)
    GROUP BY projectIdArbimon, siteIdArbimon, timePrecisionHourLocal
    ORDER BY r.upload_time ASC
    LIMIT $syncBatchLimit
  `

  const sql = sequelize.getDialect() === 'mysql' ? mysqlSQL : sqliteSQL
  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit
    }
  })
}
