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

/*
in the Arbimon we keep updated_at in UTC time
DATABASE: Arbimon

TABLE: projects
| Name | updated_at |
| Project A | 2022-05-17 11:00 |
| Project B | 2022-05-18 11:00 | <<
| Project C | 2022-05-18 12:00 |
| Project D | 2022-05-18 13:00 |
| Project E | 2022-05-18 14:00 |

----
DATABASE: Bio

[TABLE: sync_status]
synced_until: 1980-01-01 00:00

[TABLE: project]
Project A
Project B

Tests:
- Sync from nothing
- Sync new since last sync (continuation)
- Set sync_until based on last synched project
- X Set sync_until to current date (if no more projects) -- not necessary (can just keep using last synched project updated_at)
- What if 2 projects have *exactly* the same updated_at && get split by the sync limit (1 sync'd; 1 not)
- What if Arbimon data cannot be inserted into Bio? (ex: null idCore)
*/
export const getArbimonProjects = async (sequelize: Sequelize, syncUntil: Date): Promise<ArbimonProject[]> => {
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
    WHERE updated_at >= $syncUntil
    ;
    `

  const results: ArbimonProject[] = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true, bind: { syncUntil } })
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
