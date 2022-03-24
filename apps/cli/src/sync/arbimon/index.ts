import { ConnectionOptions } from 'mysql2/promise'
import { Sequelize } from 'sequelize'

import { getArbimonProjects } from '@/data-ingest/projects/arbimon'
import { writeProjectsToPostgres } from '@/data-ingest/projects/db'

export const syncProjects = async (arbimonConnectionOptions: ConnectionOptions, biodiversitySequelize: Sequelize): Promise<void> => {
  const projects = await getArbimonProjects(arbimonConnectionOptions)
  await writeProjectsToPostgres(biodiversitySequelize, projects)
}
