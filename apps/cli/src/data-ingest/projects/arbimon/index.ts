import { QueryTypes, Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

export interface ArbimonProject {
  'project_id': number
  'core_project_id': string
  'slug': string
  'name': string
  'description': string | null
  'is_private': boolean
  'reports_enabled': boolean
  'north': number
  'south': number
  'west': number
  'east': number
}

export const getArbimonProjects = async (sequelize: Sequelize): Promise<Array<Omit<Project, 'id'>>> => {
  const sql = `
    SELECT p.project_id, p.name, p.url slug, p.description, p.is_private, p.is_enabled, p.external_id core_project_id, p.reports_enabled, s.north, s.east, s.south, s.west
    FROM projects p LEFT JOIN
    (
      SELECT Max(s.lon) west, Min(s.lon) east, Min(s.lat) north, Max(s.lat) south, project_id 
      FROM sites s
      GROUP BY project_id 
    ) s
      ON p.project_id = s.project_id
    WHERE p.external_id is not null AND p.external_id != "undefined";
    `

  const results: ArbimonProject[] = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true })
  return results.map(i => {
    return {
      idCore: i.core_project_id ?? '',
      idArbimon: i.project_id,
      slug: i.slug,
      name: i.name,
      latitudeNorth: i.north ?? 0,
      latitudeSouth: i.south ?? 0,
      longitudeEast: i.east ?? 0,
      longitudeWest: i.west ?? 0
    }
  })
}
