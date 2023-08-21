import { type Sequelize, QueryTypes } from 'sequelize'

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
    ;
  `

  const isMySql = sequelize.getDialect() === 'mysql'

  const results = await sequelize.query<ArbimonRecordingDeletedQuery>(sql, {
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
    deletedAt: isMySql ? row.deletedAt.toISOString() : row.deletedAt
  }))
}

export const getArbimonProjectRecording = async (sequelize: Sequelize, projectId: number, limit: number, offset: number): Promise<unknown[]> => {
  const sql = `SELECT r.site_id siteIdArbimon,
      r.datetime datetime,
      r.duration duration,
      r.recording_id idArbimon,
      r.upload_time updatedAt
    FROM recordings r
    JOIN sites s ON s.site_id = r.site_id
    WHERE s.project_id = $projectId
      AND r.datetime is not null
      AND r.upload_time is not null
    ORDER BY r.upload_time, r.recording_id
    LIMIT $limit OFFSET $offset
    ;
  `

  const isMySql = sequelize.getDialect() === 'mysql'

  const results = await sequelize.query<ArbimonRecordingQuery>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      projectId,
      offset,
      limit
    }
  })

  return results.map(row => ({
    ...row,
    datetime: isMySql ? row.datetime.toISOString() : row.datetime,
    updatedAt: isMySql ? row.updatedAt.toISOString() : row.updatedAt
  }))
}
