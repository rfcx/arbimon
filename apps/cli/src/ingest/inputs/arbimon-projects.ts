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
}

export const getArbimonProjects = async (sequelize: Sequelize): Promise<ArbimonProject[]> => {
  const sql = `
    SELECT  p.project_id AS projectId, 
          p.name, 
          p.url AS slug, 
          p.description, 
          p.is_private AS isPrivate, 
          p.is_enabled AS reportsEnabled, 
          p.external_id AS coreProjectId, 
          p.reports_enabled
    FROM projects p
    WHERE p.external_id is not null AND p.external_id != "undefined";
    `

  const results: ArbimonProject[] = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true })
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
