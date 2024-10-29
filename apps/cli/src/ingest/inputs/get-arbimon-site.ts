import { type Sequelize, QueryTypes } from 'sequelize'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type SiteArbimon } from '../parsers/parse-site-arbimon-to-bio'
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
      s.country_code AS countryCode,
      s.updated_at AS updatedAt,
      s.deleted_at AS deletedAt,
      s.hidden
    FROM sites s
    WHERE (s.updated_at > $syncUntilDate OR (s.updated_at = $syncUntilDate AND s.site_id > $syncUntilId))
    ORDER BY s.updated_at, s.site_id
    LIMIT $syncBatchLimit`

  const results = await sequelize.query<SiteArbimon>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'sqlite' ? syncUntilDate.toISOString() : String(syncUntilDate),
      syncUntilId: String(syncUntilId),
      syncBatchLimit: String(syncBatchLimit)
    }
  })

  return results.map(row => ({
    ...row,
    deletedAt: sequelize.getDialect() === 'sqlite' && row.deletedAt !== null ? row.deletedAt : String(row.deletedAt)
  }))
}

export const getArbimonSitesByProject = async (sequelize: Sequelize, projectId: number): Promise<SiteArbimon[]> => {
  const sql = `
      SELECT s.site_id AS idArbimon,
      s.external_id AS idCore,
      s.project_id AS projectIdArbimon,
      s.name,
      s.lat AS latitude,
      s.lon AS longitude,
      s.alt AS altitude,
      s.country_code AS countryCode,
      s.updated_at AS updatedAt,
      s.deleted_at AS deletedAt,
      s.hidden
    FROM sites s
    WHERE s.project_id = $projectId AND s.deleted_at is null
    ORDER BY s.site_id`

  const results = await sequelize.query<SiteArbimon>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      projectId: String(projectId)
    }
  })

  return results
}
