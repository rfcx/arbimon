import { QueryTypes, Sequelize } from 'sequelize'

export const getArbimonProjects = async (sequelize: Sequelize, syncUntil: Date, lastSyncdId: number, batchLimit: number): Promise<Record<string, any>> => {
  const sql = `
    SELECT p.project_id AS idArbimon,
           p.external_id AS idCore,
           p.url AS slug,
           p.name
    FROM projects p
    WHERE p.updated_at > $syncUntil OR (p.updated_at = $syncUntil AND p.project_id > $lastSyncdId)
    ORDER BY p.updated_at, p.project_id
    LIMIT $batchLimit
    ;
    `

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      batchLimit,
      lastSyncdId,
      syncUntil: sequelize.getDialect() === 'mysql' ? syncUntil : syncUntil.toISOString()
    }
  })
}

export const tranformArbimonToBioProjects = (arbimonProjects: ArbimonProject[]): Array<Omit<Project, 'id'>> => {
  return arbimonProjects.map(p => ({
    idCore: p.coreProjectId,
    idArbimon: p.projectId,
    slug: p.slug,
    slugArbimon: p.slug,
    name: p.name
  }))
}
