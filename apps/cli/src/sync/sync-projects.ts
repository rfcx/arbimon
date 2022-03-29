import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { getArbimonProjects } from '@/data-ingest/projects/arbimon'
import { writeProjectsToPostgres } from '@/data-ingest/projects/db'
import { getSequelize } from '@/db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  const projects = await getArbimonProjects(getArbimonSequelize())
  await writeProjectsToPostgres(sequelize, projects)
  console.info(`Finished importing ${projects.length} projects`)
  process.exit(0)
}

await main()
