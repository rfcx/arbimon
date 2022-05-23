import { QueryTypes, Sequelize } from 'sequelize'

export const getArbimonProjects = async (sequelize: Sequelize, syncUntilDate: Date, syncUntilProjectId: number | null, batchLimit: number): Promise<Record<string, any>> => {
  const sql = `
    SELECT p.project_id AS idArbimon,
           p.external_id AS idCore,
           p.url AS slug,
           p.name
    FROM projects p
    WHERE p.updated_at > $syncUntilDate OR (p.updated_at = $syncUntilDate${(syncUntilProjectId != null) ? ' AND p.project_id > $syncUntilProjectId' : ''})
    ORDER BY p.updated_at, p.project_id
    LIMIT $batchLimit
    ;
    `

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      batchLimit,
      ...syncUntilProjectId != null && { syncUntilProjectId }, // check if last syncd project id is not null
      syncUntilDate: sequelize.getDialect() === 'mysql' ? syncUntilDate : syncUntilDate.toISOString()

    }
  })
}
