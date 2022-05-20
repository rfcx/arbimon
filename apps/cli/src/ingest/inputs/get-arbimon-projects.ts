import { QueryTypes, Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

export interface ArbimonProject {
  'projectId': number
  'coreProjectId': string
  'slug': string
  'name': string
  'description': string | null
  'isPrivate': boolean
  'reportsEnabled': boolean
  'updated_at': string
}

export const getArbimonProjects = async (sequelize: Sequelize, syncUntil: Date, lastSyncdId: number, batchLimit: number): Promise<ArbimonProject[]> => {
  const sql = `
    SELECT  p.project_id AS projectId, 
          p.name, 
          p.url AS slug, 
          p.description, 
          p.is_private AS isPrivate, 
          p.is_enabled AS reportsEnabled, 
          p.external_id AS coreProjectId, 
          p.reports_enabled,
          p.updated_at
    FROM projects p
    WHERE p.updated_at > $syncUntil OR (p.updated_at = $syncUntil AND p.project_id > $lastSyncdId)
    ORDER BY p.updated_at, p.project_id
    LIMIT $batchLimit
    ;
    `

  const results: ArbimonProject[] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: {
      batchLimit,
      lastSyncdId,
      syncUntil: sequelize.getDialect() === 'mysql' ? syncUntil : syncUntil.toISOString()
    }
  })
  return results
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
