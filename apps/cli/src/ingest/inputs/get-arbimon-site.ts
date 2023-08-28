import { type Sequelize, QueryTypes } from 'sequelize'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type SiteArbimonRow } from '../parsers/parse-site-arbimon-to-bio'
import { type SyncQueryParams } from './sync-query-params'

export const getArbimonSites = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  // Do not process query if the date is not valid
  if (!dayjs(syncUntilDate).isValid()) return []

  const sql = `
      SELECT s.site_id AS idArbimon,
      s.external_id AS idCore,
      s.project_id AS projectIdArbimon,
      s.name,
      s.lat AS latitude,
      s.lon AS longitude,
      s.alt AS altitude,
      s.updated_at AS updatedAt,
      s.deleted_at AS deletedAt
    FROM sites s
    WHERE s.updated_at > $syncUntilDate OR (s.updated_at = $syncUntilDate AND s.site_id > $syncUntilId)
    ORDER BY s.updated_at, s.site_id
    LIMIT $syncBatchLimit
    ;
    `

  const results = await sequelize.query<SiteArbimonRow>(sql, {
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
    deletedAt: sequelize.getDialect() === 'mysql' && row.deletedAt !== null ? row.deletedAt.toISOString() : row.deletedAt
  }))
}

export const getArbimonProjectSites = async (sequelize: Sequelize, projectId: number): Promise<unknown[]> => {
  const sql = `
      SELECT s.site_id AS idArbimon,
      s.external_id AS idCore,
      s.project_id AS projectIdArbimon,
      s.name,
      s.lat AS latitude,
      s.lon AS longitude,
      s.alt AS altitude,
      s.updated_at AS updatedAt,
      s.deleted_at AS deletedAt
    FROM sites s
    WHERE s.project_id = $projectId and s.deleted_at is null
    ORDER BY s.updated_at, s.site_id;
    `

  const results = await sequelize.query<SiteArbimonRow>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      projectId
    }
  })

  return results.map(row => ({
    ...row,
    deletedAt: sequelize.getDialect() === 'mysql' && row.deletedAt !== null ? row.deletedAt.toISOString() : row.deletedAt
  }))
}
