import { QueryTypes, Sequelize } from 'sequelize'

import { SyncQueryParams } from './sync-query-params'

export const getArbimonProjects = async (sequelize: Sequelize, { syncUntilDate, syncUntilId, syncBatchLimit }: SyncQueryParams): Promise<Record<string, any>> => {
  const sql = `
    SELECT p.project_id AS idArbimon,
           p.external_id AS idCore,
           p.url AS slug,
           p.name,
           p.updated_at AS updatedAt
    FROM projects p
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
