import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { getArbimonProjects, writeProjectsToPostgres } from '@/data-ingest/projects'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const projects = await getArbimonProjects()
  await writeProjectsToPostgres(params.context.sequelize, projects)
}
