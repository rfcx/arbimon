import { QueryTypes, Sequelize } from 'sequelize'

import { SyncQueryParams } from './sync-query-params'

export const getArbimonProjects = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<unknown[]> => {
  const sql = `
    SELECT p.project_id AS idArbimon,
           p.external_id AS idCore,
           p.url AS slug,
           p.name,
           p.updated_at AS updatedAt,
           s.north AS latitudeNorth,
           s.south AS latitudeSouth,
           s.east AS longitudeEast,
           s.west AS longitudeWest
    FROM projects p 
    LEFT JOIN (
      SELECT  project_id,
              IFNULL(Min(s.lat), 0) north, 
              IFNULL(Max(s.lat), 0) south,
              IFNULL(Min(s.lon), 0) east,
              IFNULL(Max(s.lon), 0) west
      FROM sites s
      GROUP BY project_id 
    ) s
    ON p.project_id = s.project_id
    WHERE p.updated_at > $syncUntilDate OR (p.updated_at = $syncUntilDate AND p.project_id > $syncUntilId)
    ORDER BY p.updated_at, p.project_id
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
