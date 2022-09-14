import { QueryTypes, Sequelize } from 'sequelize'

import { ProjectArbimonRow } from '../parsers/parse-project-arbimon-to-bio'
import { SyncQueryParams } from './sync-query-params'

export const getArbimonProjects = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  const sql = `
    SELECT p.project_id AS idArbimon,
           p.external_id AS idCore,
           p.url AS slug,
           p.name,
           p.updated_at AS updatedAt,
           (CASE WHEN s.north IS NULL THEN 0 ELSE s.north END) latitudeNorth,
           (CASE WHEN s.south IS NULL THEN 0 ELSE s.south END) latitudeSouth,
           (CASE WHEN s.east IS NULL THEN 0 ELSE s.east END) longitudeEast,
           (CASE WHEN s.west IS NULL THEN 0 ELSE s.west END) longitudeWest,
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

    const results = await sequelize.query<ProjectArbimonRow>(sql, {
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
