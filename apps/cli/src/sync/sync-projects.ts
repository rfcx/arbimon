import { getArbimonProjects } from '@//data-ingest/projects/arbimon'
import { writeProjectsToPostgres } from '@/data-ingest/projects/db'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const projects = await getArbimonProjects()
  await writeProjectsToPostgres(sequelize, projects)
  console.info(`Finished importing ${projects.length} projects`)
  process.exit(0)
}

await main()
