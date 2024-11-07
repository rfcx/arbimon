import { countBy } from 'lodash-es'
import { type Sequelize, QueryTypes } from 'sequelize'

import { type SyncStatus } from '@rfcx-bio/node-common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type SyncQueryParams } from './sync-query-params'

export interface ArbimonRecordingQuery {
  siteIdArbimon: number
  datetime: Date
  duration: number
  idArbimon: number
  updatedAt: Date
}

export interface ArbimonRecordingDeletedQuery {
  idArbimon: number
  siteIdArbimon: number
  datetime: Date
  duration: number
  deletedAt: Date
}

export interface ArbimonRecordingByHour {
  siteIdArbimon: number
  timePrecisionHourLocal: Date
  countsByMinute: Record<number, number>
  totalDurationInMinutes: number
}

type ArbimonRecordingByHourRaw = Omit<ArbimonRecordingByHour, 'countsByMinute' | 'totalDurationInMinutes'> & { minutes: string, duration: number }

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
  `

  const isMySql = sequelize.getDialect() === 'mysql'

  const results = await sequelize.query<ArbimonRecordingQuery>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: isMySql ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit: String(syncBatchLimit)
    }
  })

  return results.map(row => ({
    ...row,
    datetime: isMySql ? row.datetime.toISOString() : row.datetime,
    updatedAt: isMySql ? row.updatedAt.toISOString() : row.updatedAt
  }))
}

export const getArbimonRecordingDeleted = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  // Do not process query if the date is not valid
  if (!dayjs(syncUntilDate).isValid()) return []

  const sql = `SELECT recording_id idArbimon,
      site_id siteIdArbimon,
      datetime datetime,
      duration duration,
      deleted_at deletedAt
    FROM recordings_deleted
    WHERE deleted_at > $syncUntilDate OR (deleted_at = $syncUntilDate AND recording_id > $syncUntilId)
    ORDER BY deleted_at, recording_id
    LIMIT $syncBatchLimit
  `

  const isMySql = sequelize.getDialect() === 'mysql'

  const results = await sequelize.query<ArbimonRecordingDeletedQuery>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: isMySql ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit: String(syncBatchLimit)
    }
  })

  return results.map(row => ({
    ...row,
    datetime: isMySql ? row.datetime.toISOString() : row.datetime,
    deletedAt: isMySql ? row.deletedAt.toISOString() : row.deletedAt
  }))
}

export const getArbimonProjectRecording = async (sequelize: Sequelize, projectId: number, limit: number, offset: number): Promise<unknown[]> => {
  const sql = `SELECT /*+ MAX_EXECUTION_TIME(840000) */ r.site_id siteIdArbimon,
      r.datetime datetime,
      r.duration duration,
      r.recording_id idArbimon,
      r.upload_time updatedAt
    FROM recordings r
    JOIN sites s ON s.site_id = r.site_id
    WHERE s.project_id = $projectId
      AND r.datetime is not null
      AND r.upload_time is not null
      AND r.duration is not null
      AND s.deleted_at is null
    ORDER BY r.upload_time, r.recording_id
    LIMIT $limit OFFSET $offset
  `

  const isMySql = sequelize.getDialect() === 'mysql'

  const results = await sequelize.query<ArbimonRecordingQuery>(sql, {
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
    datetime: isMySql ? row.datetime.toISOString() : row.datetime,
    updatedAt: isMySql ? row.updatedAt.toISOString() : row.updatedAt
  }))
}

export const getArbimonProjectRecordingsBySiteHour = async (sequelize: Sequelize, projectId: number, syncStatus: Pick<SyncStatus, 'syncUntilDate' | 'syncUntilId'>, limit: number, offset: number): Promise<ArbimonRecordingByHour[]> => {
  const sql = `
    SELECT /*+ MAX_EXECUTION_TIME(840000) */ r.site_id siteIdArbimon,
      FROM_UNIXTIME(UNIX_TIMESTAMP(r.datetime) - MOD(UNIX_TIMESTAMP(r.datetime),3600)) timePrecisionHourLocal, 
      GROUP_CONCAT(MOD(UNIX_TIMESTAMP(r.datetime), 3600) DIV 60) minutes,
      SUM(duration) duration
    FROM recordings r JOIN sites s ON s.site_id = r.site_id
    WHERE s.project_id = $projectId
      AND s.deleted_at is null
      AND r.datetime is not null
    GROUP BY 1, 2 ORDER BY 1, 2
    LIMIT $limit OFFSET $offset
  `
  // AND r.upload_time < $syncUntilDate OR (r.upload_time = $syncUntilDate AND r.recording_id <= $syncUntilId)
  // AND r.duration is not null

  const isMySql = sequelize.getDialect() === 'mysql'

  const results = await sequelize.query<ArbimonRecordingByHourRaw>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      projectId: String(projectId),
      syncUntilDate: isMySql ? syncStatus.syncUntilDate : syncStatus.syncUntilDate.toISOString(),
      syncUntilId: syncStatus.syncUntilId,
      offset: String(offset),
      limit: String(limit)
    }
  })

  return results.map(({ minutes, duration, ...row }) => ({
    ...row,
    countsByMinute: countBy(minutes.split(',').map(s => Number(s))),
    totalDurationInMinutes: duration / 60
  }))
}
