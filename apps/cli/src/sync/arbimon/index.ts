import { Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonProjects } from '@/data-ingest/projects/arbimon'
import { writeProjectsToPostgres } from '@/data-ingest/projects/db'
import { refreshMviews } from '@/db/actions/refresh-mviews'
import { syncAllForProject } from '@/sync/all'

export const syncProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  const projects = await getArbimonProjects(arbimonSequelize)
  await writeProjectsToPostgres(biodiversitySequelize, projects)
}

export const syncAllBasedOnDetectionsForProject = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, project: Project): Promise<void> => {
  await syncAllForProject(arbimonSequelize, biodiversitySequelize, project)
  await refreshMviews(biodiversitySequelize)
}
