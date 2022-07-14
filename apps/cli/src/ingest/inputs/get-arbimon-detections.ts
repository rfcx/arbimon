import { QueryTypes, Sequelize } from 'sequelize'

import { SyncQueryParams } from './sync-query-params'

export const getArbimonDetections = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  const offset = syncUntilId
  const mysqlSQL = `
    SELECT
      s.project_id projectId,
      date(r.datetime) date,
      hour(r.datetime) hour,
      r.site_id siteId,
      rv.species_id speciesId,
      count(rv.species_id) detection_count detectionCount,
      GROUP_CONCAT(minute(r.datetime) SEPARATOR ',') as detectionMinutes,
      GROUP_CONCAT(DISTINCT rv.recording_validation_id ORDER BY rv.recording_validation_id ASC SEPARATOR ';') as detectionId,
      rv.updated_at updatedAt
    FROM recordings r
    JOIN recording_validations rv ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
    LEFT JOIN sites s ON r.site_id = s.site_id
    WHERE rv.updated_at > $syncUntilDate
    GROUP BY s.project_id, r.site_id, date(r.datetime), hour(r.datetime), rv.species_id
    ORDER BY rv.updated_at, s.project_id, hour, r.site_id, rv.species_id
    LIMIT $syncBatchLimit
    OFFSET ${offset}
  ;
  `

  const sqliteSQL = `
    SELECT
      s.project_id projectId,
      date(r.datetime) date,
      strftime('%H',r.datetime) hour,
      r.site_id siteId,
      rv.species_id speciesId,
      count(1) detectionCount,
      GROUP_CONCAT(strftime('%M',r.datetime), ',') as detectionMinutes,
      GROUP_CONCAT(rv.recording_validation_id, ';') detectionId,
      rv.updated_at updatedAt
    FROM recordings r
    JOIN recording_validations rv ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
    LEFT JOIN sites s ON r.site_id = s.site_id
    WHERE rv.updated_at > $syncUntilDate
    GROUP BY s.project_id, r.site_id, date(r.datetime), strftime('%H',r.datetime), rv.species_id
    ORDER BY rv.updated_at, s.project_id, hour, r.site_id, rv.species_id
    LIMIT $syncBatchLimit
    OFFSET ${offset}
  ;
  `

  const sql = sequelize.getDialect() === 'mysql' ? mysqlSQL : sqliteSQL

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString(),
      syncBatchLimit
    }
   })
}
