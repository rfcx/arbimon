import { QueryTypes, Sequelize } from 'sequelize'

import { SyncQueryParams } from './sync-query-params'

export const getArbimonDetections = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  const isMysqlSQL = sequelize.getDialect() === 'mysql'

  const sql = `
    SELECT
      rv.recording_validation_id idArbimon,
      r.datetime,
      date(r.datetime) date,
      ${isMysqlSQL ? 'hour(r.datetime)' : "strftime('%H', r.datetime)"} hour,
      r.site_id siteId,
      r.duration recordingDuration,
      rv.species_id speciesId,
      rv.present,
      rv.present_review presentReview,
      rv.present_aed presentAed,
      rv.updated_at updatedAt
    FROM recording_validations rv
    JOIN recordings r ON rv.recording_id = r.recording_id
    WHERE rv.updated_at > $syncUntilDate OR (rv.updated_at = $syncUntilDate AND rv.recording_validation_id > $syncUntilId)
    ORDER BY rv.updated_at, rv.recording_validation_id
    LIMIT $syncBatchLimit
  ;
  `

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
