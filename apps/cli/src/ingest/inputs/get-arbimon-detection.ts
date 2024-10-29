import { countBy } from 'lodash-es'
import { type Sequelize, QueryTypes } from 'sequelize'

import { type SyncStatus } from '@rfcx-bio/node-common/dao/types'
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

export interface ArbimonDetectionBySiteSpeciesHour {
  siteIdArbimon: number
  speciesIdArbimon: number
  timePrecisionHourLocal: Date
  countsByMinute: Record<number, number>
}

type ArbimonDetectionBySiteSpeciesHourRaw = Omit<ArbimonDetectionBySiteSpeciesHour, 'countsByMinute'> & { minutes: string }

export const getArbimonDetections = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  // Do not process query if the date is not valid
  if (!dayjs(syncUntilDate).isValid()) return []

  const isSqlite = sequelize.getDialect() === 'sqlite'

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
      syncUntilDate: isSqlite ? syncUntilDate.toISOString() : String(syncUntilDate),
      syncUntilId: String(syncUntilId),
      syncBatchLimit: String(syncBatchLimit)
    }
  })

  return results.map(row => ({
    ...row,
    datetime: isSqlite ? row.datetime : String(row.datetime),
    updatedAt: isSqlite ? row.updatedAt : String(row.updatedAt)
  }))
}

export const getArbimonProjectDetection = async (sequelize: Sequelize, projectId: number, limit: number, offset: number): Promise<unknown[]> => {
  const isSqlite = sequelize.getDialect() === 'sqlite'

  const sql = `
    SELECT /*+ MAX_EXECUTION_TIME(840000) */
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
    JOIN sites s ON r.site_id = s.site_id
    WHERE rv.project_id = $projectId
      AND (rv.present = 1 OR rv.present_review > 0 OR rv.present_aed > 0)
      AND r.datetime is not null
      AND r.datetime_utc is not null
      AND r.upload_time is not null
      AND r.duration is not null
      AND s.deleted_at is null
    ORDER BY rv.updated_at, rv.recording_validation_id
    LIMIT $limit OFFSET $offset
  ;
  `

  const results = await sequelize.query<DetectionArbimonQuery>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      projectId: String(projectId),
      offset: String(offset),
      limit: String(limit)
    }
  })

  return results.map(row => ({
    ...row,
    datetime: isSqlite ? row.datetime : String(row.datetime),
    updatedAt: isSqlite ? row.updatedAt : String(row.updatedAt)
  }))
}

export const getArbimonProjectDetectionBySiteSpeciesHours = async (sequelize: Sequelize, projectId: number, syncStatus: Pick<SyncStatus, 'syncUntilDate' | 'syncUntilId'>, limit: number, offset: number): Promise<ArbimonDetectionBySiteSpeciesHour[]> => {
  const sql = `
    SELECT /*+ MAX_EXECUTION_TIME(840000) */ r.site_id siteIdArbimon, rv.species_id speciesIdArbimon,
      FROM_UNIXTIME(UNIX_TIMESTAMP(r.datetime) - MOD(UNIX_TIMESTAMP(r.datetime),3600)) timePrecisionHourLocal, 
      GROUP_CONCAT(MOD(UNIX_TIMESTAMP(r.datetime), 3600) DIV 60) minutes
    FROM recording_validations rv
      JOIN recordings r ON rv.recording_id = r.recording_id
      JOIN sites s ON s.site_id = r.site_id
    WHERE s.project_id = $projectId
      AND s.deleted_at is null
      AND r.datetime is not null
      AND (rv.present = 1 OR rv.present_review > 0 OR rv.present_aed > 0)
    GROUP BY 1, 2, 3 ORDER BY 1, 2, 3
    LIMIT $limit OFFSET $offset
  `
  // AND r.upload_time < $syncUntilDate OR (r.upload_time = $syncUntilDate AND r.recording_id <= $syncUntilId)
  // AND r.duration is not null

  const isSqlite = sequelize.getDialect() === 'sqlite'

  const results = await sequelize.query<ArbimonDetectionBySiteSpeciesHourRaw>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      projectId,
      syncUntilDate: isSqlite ? syncStatus.syncUntilDate.toISOString() : String(syncStatus.syncUntilDate),
      syncUntilId: String(syncStatus.syncUntilId),
      offset: String(limit),
      limit: String(limit)
    }
  })

  return results.map(({ minutes, ...row }) => ({
    ...row,
    countsByMinute: countBy(minutes.split(',').map(s => Number(s)))
  }))
}
