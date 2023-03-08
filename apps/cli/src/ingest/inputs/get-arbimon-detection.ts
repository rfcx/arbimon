import { type Sequelize, QueryTypes } from 'sequelize'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type SyncQueryParams } from './sync-query-params'

export interface DetectionArbimonQuery {
  idArbimon: number
  datetime: Date
  date: Date
  hour: number
  siteId: number
  recordingDuration: number
  speciesId: number
  present: number | null
  presentReview: number
  presentAed: number
  updatedAt: Date
}

export const getArbimonDetections = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  // Do not process query if the date is not valid
  if (!dayjs(syncUntilDate).isValid()) return []

  const isMySql = sequelize.getDialect() === 'mysql'

  const sql = `
    SELECT
      rv.recording_validation_id idArbimon,
      r.datetime,
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

  const results = await sequelize.query<DetectionArbimonQuery>(sql, {
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
