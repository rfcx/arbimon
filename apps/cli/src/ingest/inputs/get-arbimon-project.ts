import { type Sequelize, QueryTypes } from 'sequelize'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { type SyncQueryParams } from './sync-query-params'

export const getArbimonProjects = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<ProjectArbimon[]> => {
  // Do not process query if the date is not valid
  if (!dayjs(syncUntilDate).isValid()) return []

  const sql = `
    SELECT p.project_id AS idArbimon,
           p.external_id AS idCore,
           p.url AS slug,
           p.name,
           (CASE WHEN s.north IS NULL THEN 0 ELSE s.north END) latitudeNorth,
           (CASE WHEN s.south IS NULL THEN 0 ELSE s.south END) latitudeSouth,
           (CASE WHEN s.east IS NULL THEN 0 ELSE s.east END) longitudeEast,
           (CASE WHEN s.west IS NULL THEN 0 ELSE s.west END) longitudeWest,
           p.is_private AS isPrivate,
           p.updated_at AS updatedAt,
           p.deleted_at AS deletedAt
    FROM projects p 
    LEFT JOIN (
      SELECT project_id,
             Min(s.lat) north, 
             Max(s.lat) south,
             Min(s.lon) east,
             Max(s.lon) west
      FROM sites s
      GROUP BY project_id 
    ) s
    ON p.project_id = s.project_id
    WHERE p.updated_at > $syncUntilDate OR (p.updated_at = $syncUntilDate AND p.project_id > $syncUntilId)
    ORDER BY p.updated_at, p.project_id
    LIMIT $syncBatchLimit
    ;
    `

  return await sequelize.query<ProjectArbimon>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString(),
      syncUntilId,
      syncBatchLimit: String(syncBatchLimit)
    }
  })
}
