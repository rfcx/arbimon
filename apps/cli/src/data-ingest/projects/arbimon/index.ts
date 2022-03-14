import { Project } from '@rfcx-bio/common/dao/types'

import { mysqlSelect } from '../../../_services/mysql'
import { ARBIMON_CONFIG } from '../../_connections/arbimon'

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

export const getArbimonProjects = async (): Promise<Array<Omit<Project, 'id'>>> => {
  const sql =
    `
    select p.project_id, p.name, p.url slug, p.description, p.is_private, p.is_enabled, p.external_id core_project_id, p.reports_enabled, s.north, s.east, s.south, s.west
    from projects p right join
    (
      select Max(s.lon) west, Min(s.lon) east, Min(s.lat) north, Max(s.lat) south, project_id 
      from sites s
      group by project_id 
    ) s
      on p.project_id = s.project_id
    where p.external_id is not null and p.external_id != "undefined";
    `

  // Query Arbimon
  const results = await mysqlSelect<ArbimonProject>(ARBIMON_CONFIG, sql)
  return results.map(i => {
    return {
      idCore: i.core_project_id,
      idArbimon: i.project_id,
      slug: i.slug,
      slugArbimon: i.slug,
      isPublished: false,
      name: i.name,
      latitudeNorth: i.north,
      latitudeSouth: i.south,
      longitudeEast: i.east,
      longitudeWest: i.west
    }
  })
}
