import { QueryTypes, Sequelize } from 'sequelize'

import { SyncQueryParams } from './sync-query-params'

export const getArbimonRecordingValidations = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  const mysqlSQL = `
    SELECT rvc.project_id,
      rvc.date,
      rvc.hour,
      rvc.site_id,
      rvc.species_id,
      rvc.detection_count detectionCount,
      rc.duration_in_minutes,
      rvc.updated_at
    FROM (
      SELECT s.project_id,
        date(r.datetime) date,
        hour(r.datetime) hour,
        r.site_id,
        rv.species_id,
        count(rv.species_id) detection_count,
        rv.updated_at
      FROM recordings r
      LEFT JOIN recording_validations rv ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
      LEFT JOIN sites s ON r.site_id = s.site_id
      WHERE rv.species_id is not NULL and r.datetime_utc is not null
      GROUP BY s.project_id, r.site_id, date(r.datetime), hour(r.datetime), rv.species_id
    ) rvc
    JOIN (
      SELECT r.site_id,
        hour(r.datetime) hour,
        date(r.datetime) date,
        SUM(r.duration)/60 duration_in_minutes
      FROM recordings r
      GROUP by hour(r.datetime), date(r.datetime), r.site_id) rc
    ON rvc.hour = rc.hour AND rvc.date = rc.date AND rvc.site_id = rc.site_id
    WHERE rvc.updated_at > $syncUntilDate 
    OR (rvc.updated_at = $syncUntilDate AND rvc.recording_validation_id > $syncUntilId)
    ORDER BY rvc.updated_at, rvc.date, rvc.hour, rvc.site_id, rvc.species_id
    LIMIT $syncBatchLimit
    ;
  `

  const sqliteSQL = `
  SELECT rvc.project_id,
       rvc.date,
       rvc.hour,
       rvc.site_id,
       rvc.species_id,
       rvc.detection_count detectionCount,
       rc.duration_in_minutes,
       rvc.updated_at
  FROM (
    SELECT  s.project_id,
            r.datetime,
            date(r.datetime) date,
            strftime('%H',r.datetime) hour,
            r.site_id,
            rv.species_id,
            count(1) detection_count,
            rv.updated_at
    FROM recordings r
    LEFT JOIN recording_validations rv
      ON r.recording_id = rv.recording_id AND (rv.present = 1 or rv.present_review > 0)
    JOIN sites s ON r.site_id = s.site_id
    WHERE rv.species_id is not NULL and r.datetime_utc is not null
    GROUP BY s.project_id, r.site_id, date(r.datetime), strftime('%H',r.datetime), rv.species_id
  ) rvc
  JOIN (
    SELECT r.site_id, 
        strftime('%H',r.datetime) hour, 
        date(r.datetime) date, 
        SUM(r.duration)/60 duration_in_minutes
    FROM recordings r
    GROUP by strftime('%H',r.datetime), date(r.datetime), r.site_id
  ) rc
  ON rvc.hour = rc.hour AND rvc.date = rc.date AND rvc.site_id = rc.site_id
  WHERE rvc.updated_at > $syncUntilDate 
  ORDER BY rvc.updated_at, rvc.date, rvc.hour, rvc.site_id, rvc.species_id
  LIMIT $syncBatchLimit
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
