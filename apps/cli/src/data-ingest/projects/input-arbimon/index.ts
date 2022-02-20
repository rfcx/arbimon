import * as fs from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { Project } from '@rfcx-bio/common/dao/types'

import { mysqlSelect } from '../../../_services/mysql'
import { ARBIMON_CONFIG } from '../../_connections/arbimon'
import { ArbimonProject } from './type'

export const getArbimonProjects = async (): Promise<Array<Omit<Project, 'id'>>> => {
  // Read SQL
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const sqlPath = resolve(currentDir, './get-projects.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  // Query Arbimon
  const results = await mysqlSelect<ArbimonProject>(ARBIMON_CONFIG, sql)
  return results.map(i => {
    return {
      idCore: i.core_project_id,
      slug: i.slug,
      slugArbimon: i.slug,
      isPublished: i.reports_enabled,
      name: i.name,
      latitudeNorth: i.north,
      latitudeSouth: i.south,
      longitudeEast: i.east,
      longitudeWest: i.west
    }
  })
}
