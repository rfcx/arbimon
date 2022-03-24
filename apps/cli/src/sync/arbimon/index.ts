import { Sequelize } from 'sequelize'

import { getArbimonProjects } from '@/data-ingest/projects/arbimon'
import { writeProjectsToPostgres } from '@/data-ingest/projects/db'

export const syncProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  const projects = await getArbimonProjects(arbimonSequelize)
  await writeProjectsToPostgres(biodiversitySequelize, projects)
}
